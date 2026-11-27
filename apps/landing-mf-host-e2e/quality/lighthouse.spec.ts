import { workspaceRoot } from '@nx/devkit';
import { expect, test } from '@playwright/test';
import lighthouse, { type Config, generateReport } from 'lighthouse';
import { ok } from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const reportDir = join(workspaceRoot, 'dist/reports/landing-quality');

const lighthouseConfig: Config = {
  extends: 'lighthouse:default',
  audits: [{
    path: 'errors-in-console',
    options: {
      ignoredPatterns: [
        'ERR_BLOCKED_BY_CLIENT.Inspector',
        // The audit container has no hardware WebGL context for the decorative halo.
        /^THREE\.WebGLRenderer: Error creating WebGL context\.$/,
      ],
    },
  }],
};

test('audits the Docker SSR homepage with Lighthouse', async ({ baseURL }) => {
  const homepage = new URL('/', baseURL);
  const audit = await lighthouse(homepage.href, { port: 9222 }, lighthouseConfig);

  ok(audit, 'Lighthouse did not return an audit.');

  const { lhr } = audit;

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
