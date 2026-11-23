import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const storybookUrl = 'http://127.0.0.1:6006';
const baseURL = process.env['BASE_URL'] ?? storybookUrl;

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './e2e' }),
  // Story loaders convert large schemas in the browser; parallel pages delay
  // Monaco and graph initialization beyond individual assertion timeouts.
  workers: 1,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  use: {
    baseURL,
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'on',
  },
  webServer: process.env['BASE_URL']
    ? undefined
    : {
        command: 'npx nx run @codegena/playground-ui:storybook-e2e',
        cwd: workspaceRoot,
        gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
        reuseExistingServer: !process.env['CI'],
        timeout: 180_000,
        url: storybookUrl,
      },
});
