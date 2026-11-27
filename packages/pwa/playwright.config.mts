import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: '../../dist/.playwright/packages/pwa',
  fullyParallel: true,
  retries: 0,
  use: {
    ...devices['Desktop Chrome'],
    headless: true,
    serviceWorkers: 'allow',
    trace: 'retain-on-failure',
  },
});
