import { defineConfig } from '@playwright/test';

import landingConfig, { returningVisitorStorage } from './playwright.config.mjs';

const baseURL = 'https://localhost:8443';

export default defineConfig({
  ...landingConfig,
  globalSetup: './start-ssr-test-stack.mts',
  testDir: './ssr',
  use: {
    ...landingConfig.use,
    baseURL,
    storageState: returningVisitorStorage(baseURL),
    launchOptions: { args: ['--ignore-certificate-errors'] },
  },
  webServer: undefined,
});
