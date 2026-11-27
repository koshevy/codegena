import {
  desktopChromiumProject,
  e2eCommonOptions,
  mobileChromiumProject,
} from '@codegena/util-e2e';
import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:8113';
const serverTarget = process.env['DOCUMENTATION_E2E_SERVER'] === 'production'
  ? 'serve-static'
  : 'serve:e2e';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  expect: { toHaveScreenshot: e2eCommonOptions.screenshots },
  retries: 0,
  workers: 1,
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: [{
    command: [
      `npm exec -- nx run documentation-mf-remote:${serverTarget}`,
      '--output-style=stream',
    ].join(' '),
    url: baseURL,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    cwd: workspaceRoot,
  }, {
    command: [
      'npm exec -- nx run documentation-mf-remote-e2e:serve-host',
      '--output-style=stream',
    ].join(' '),
    url: 'http://127.0.0.1:8114',
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGINT', timeout: 5000 },
    cwd: workspaceRoot,
  }],
  projects: [desktopChromiumProject, mobileChromiumProject],
});
