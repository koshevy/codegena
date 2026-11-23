import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:8101';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  retries: 0,
  workers: 1,
  use: { baseURL, headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm exec -- nx run playground-mf-remote:serve',
    url: baseURL,
    reuseExistingServer: false,
    cwd: workspaceRoot,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
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
