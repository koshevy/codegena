import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:8113';
const serverTarget = process.env['DOCUMENTATION_E2E_SERVER'] === 'production'
  ? 'serve-static'
  : 'serve:e2e';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
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
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iPhone 15',
      use: {
        ...devices['iPhone 15'],
        browserName: 'chromium',
        userAgent: devices['Pixel 7'].userAgent,
      },
    },
  ],
});
