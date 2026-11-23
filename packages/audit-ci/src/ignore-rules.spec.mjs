import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { decideShouldBeIgnored } from './decide-should-be-ignored.mjs';
import { handleAuditResult } from './handle-audit-result.mjs';
import { parseVulnerabilitiesIgnore } from './parse-vulnerabilities-ignore.mjs';

function parseRules(context, content) {
  const directory = mkdtempSync(join(tmpdir(), 'codegena-audit-rules-'));

  context.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, '.vulnerabilities-ignore.json'), JSON.stringify(content));

  return parseVulnerabilitiesIgnore(directory);
}

test('retains the explanation of an advisory exception supplied by ID', (context) => {
  const rules = parseRules(context, {
    cwe: [],
    ghsa: [{
      id: 'GHSA-gcqx-w48m-w2h4',
      expires: '2099-01-01',
      description: 'Reviewed temporary exception',
    }],
  });

  assert.equal(rules.ghsa['GHSA-gcqx-w48m-w2h4'].description,
    'Reviewed temporary exception');
});

test('rejects invalid collections and ambiguous advisory selectors', (context) => {
  assert.throws(() => parseRules(context, { cwe: null, ghsa: [] }));
  assert.throws(() => parseRules(context, {
    cwe: [],
    ghsa: [{
      id: 'GHSA-gcqx-w48m-w2h4',
      url: 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4',
      expires: '2099-01-01',
    }],
  }));
});

test('requires an active exception for every related CWE', (context) => {
  const ignoreRules = parseRules(context, {
    cwe: [{ id: 'CWE-1321', expires: '2099-01-01' }],
    ghsa: [],
  });

  const input = {
    dependency: 'deepmerge',
    ghsaId: 'GHSA-gcqx-w48m-w2h4',
    ghsaTitle: 'Prototype poisoning',
    ignoreRules,
    versionRange: '<=4.3.1',
  };

  assert.equal(decideShouldBeIgnored({ ...input, cwe: ['CWE-1321'] })
    .shouldBeIgnored, true);
  assert.equal(decideShouldBeIgnored({ ...input, cwe: ['CWE-1321', 'CWE-400'] })
    .shouldBeIgnored, false);
});

test('preserves the real report total while evaluating its original advisory',
  async (context) => {
    const audit = JSON.parse(readFileSync(
      new URL('./__fixtures__/npm-audit.json', import.meta.url), 'utf8',
    ));

    const directory = mkdtempSync(join(tmpdir(), 'codegena-audit-report-'));

    context.after(() => rmSync(directory, { recursive: true, force: true }));
    writeFileSync(join(directory, '.vulnerabilities-ignore.json'),
      JSON.stringify({ cwe: [], ghsa: [] }));

    const summary = await handleAuditResult(audit, directory);

    assert.equal(summary.totalVulnerabilities, 21);
    assert.equal(summary.allVulnerabilities.length, 1);
    assert.equal(summary.allVulnerabilities[0].id, 'GHSA-gcqx-w48m-w2h4');
    assert.equal(summary.allVulnerabilities[0].shouldBeIgnored, false);
  });

test('rejects a malformed advisory even when another advisory is ignored',
  async (context) => {
    const directory = mkdtempSync(join(tmpdir(), 'codegena-audit-incomplete-'));

    context.after(() => rmSync(directory, { recursive: true, force: true }));
    writeFileSync(join(directory, '.vulnerabilities-ignore.json'), JSON.stringify({
      cwe: [],
      ghsa: [{ id: 'GHSA-gcqx-w48m-w2h4', expires: '2099-01-01' }],
    }));

    const audit = JSON.parse(readFileSync(
      new URL('./__fixtures__/npm-audit.json', import.meta.url), 'utf8',
    ));

    audit.vulnerabilities['incomplete'] = {
      nodes: [],
      via: [{ title: 'Missing advisory URL', severity: 'low', cwe: [], range: '*' }],
    };

    await assert.rejects(handleAuditResult(audit, directory), /invalid advisory/i);
  });
