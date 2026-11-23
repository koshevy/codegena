import { defineConfig } from '@playwright/test';

import ssrConfig from './playwright.ssr.config.mjs';

export default defineConfig({
  ...ssrConfig,
  projects: [{ name: 'Lighthouse' }],
  retries: 0,
  testDir: './quality',
  timeout: 120_000,
});
