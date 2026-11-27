import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const audit = readFileSync(new URL('./__fixtures__/npm-audit.json', import.meta.url),
  'utf8');
const cli = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url));

function executeCli(context, exceptions, output = audit, exitCode = 1) {
  const directory = mkdtempSync(join(tmpdir(), 'codegena-audit-cli-'));
  const bin = join(directory, 'bin');
  const npm = join(bin, 'npm');

  context.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(bin);
  copyFileSync(new URL('./__fixtures__/npm.mjs', import.meta.url), npm);
  chmodSync(npm, 0o755);
  writeFileSync(join(directory, 'package.json'), '{"type":"module"}');
  writeFileSync(join(directory, '.vulnerabilities-ignore.json'),
    JSON.stringify(exceptions));
  writeFileSync(join(directory, '.audit-output'), output);
  writeFileSync(join(directory, '.audit-exit'), String(exitCode));

  return spawnSync(process.execPath, [cli], {
    cwd: directory,
    encoding: 'utf8',
    env: { ...process.env, PATH: `${bin}${delimiter}${process.env['PATH'] ?? ''}` },
  });
}

test('runs from MJS source and fails for an unhandled advisory', (context) => {
  const result = executeCli(context, { cwe: [], ghsa: [] });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /GHSA-gcqx-w48m-w2h4/);
  assert.match(result.stderr, /Found unhandled vulnerabilities/);
});

test('accepts chunked npm output and prints the active exception', (context) => {
  const result = executeCli(context, {
    cwe: [],
    ghsa: [{
      id: 'GHSA-gcqx-w48m-w2h4',
      expires: '2099-01-01',
      description: 'Reviewed temporary exception',
    }],
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /Reviewed temporary exception/);
  assert.match(result.stdout, /Unhandled vulnerabilities not found/);
});

test('reactivates an expired exception', (context) => {
  const result = executeCli(context, {
    cwe: [],
    ghsa: [{ id: 'GHSA-gcqx-w48m-w2h4', expires: '2000-01-01' }],
  });

  assert.equal(result.status, 1);
});

test('fails on malformed audit output', (context) => {
  const result = executeCli(context, { cwe: [], ghsa: [] }, 'invalid JSON');

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Cannot read a complete npm audit report/);
});

test('does not treat a failed npm process as an accepted audit', (context) => {
  const result = executeCli(context, { cwe: [], ghsa: [] }, audit, 2);

  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stdout, /Unhandled vulnerabilities not found/);
});
