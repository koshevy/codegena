import { defineConfig } from '@playwright/test';

import landingConfig from './playwright.config.mjs';

export default defineConfig({
  ...landingConfig,
  globalSetup: './start-ssr-test-stack.mts',
  testDir: './ssr',
  use: {
    ...landingConfig.use,
    baseURL: 'https://localhost:8443',
    launchOptions: { args: ['--ignore-certificate-errors'] },
  },
  webServer: undefined,
});
