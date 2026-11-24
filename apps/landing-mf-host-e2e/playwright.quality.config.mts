import { defineConfig } from '@playwright/test';

import landingConfig from './playwright.config.mjs';

export default defineConfig({
  ...landingConfig,
  projects: [{ name: 'Lighthouse' }],
  retries: 0,
  testDir: './quality',
  timeout: 120_000,
  use: { baseURL: 'https://localhost:8443' },
  webServer: undefined,
});
