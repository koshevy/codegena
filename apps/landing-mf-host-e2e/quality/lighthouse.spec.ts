import { workspaceRoot } from '@nx/devkit';
import { chromium, expect, test } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse, { generateReport, type RunnerResult } from 'lighthouse';
import { ok } from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const reportDir = join(workspaceRoot, 'dist/reports/landing-quality');

async function auditHomepage(homepage: URL): Promise<RunnerResult> {
  const chrome = await launch({
    chromeFlags: ['--headless', '--ignore-certificate-errors'],
    chromePath: chromium.executablePath(),
  });

  try {
    const audit = await lighthouse(homepage.href, { port: chrome.port });

    ok(audit, 'Lighthouse did not return an audit.');

    return audit;
  }
  finally {
    chrome.kill();
  }
}

test('audits the Docker SSR homepage with Lighthouse', async ({ baseURL }) => {
  const homepage = new URL('/', baseURL);
  const { lhr } = await auditHomepage(homepage);

  await mkdir(reportDir, { recursive: true });
  await Promise.all([
    writeFile(join(reportDir, 'lighthouse.html'), generateReport(lhr, 'html')),
    writeFile(join(reportDir, 'lighthouse.json'), generateReport(lhr, 'json')),
  ]);

  expect(lhr.runtimeError).toBeUndefined();
  expect(lhr.finalDisplayedUrl).toBe(homepage.href);
  expect({
    performance: lhr.categories['performance']?.score,
    accessibility: lhr.categories['accessibility']?.score,
    bestPractices: lhr.categories['best-practices']?.score,
    seo: lhr.categories['seo']?.score,
  }).toEqual({
    performance: 1,
    accessibility: 1,
    bestPractices: 1,
    seo: 1,
  });
});
