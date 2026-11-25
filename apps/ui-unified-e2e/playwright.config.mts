import { desktopChromiumProject, e2eCommonOptions } from '@codegena/util-e2e';
import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig } from '@playwright/test';

const storybookUrl = 'http://127.0.0.1:6007';
const baseURL = process.env['BASE_URL'] ?? storybookUrl;

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './e2e' }),
  expect: { toHaveScreenshot: e2eCommonOptions.screenshots },
  // Cold Storybook pages compile Monaco modules on the same dev server.
  workers: 2,
  projects: [{ ...desktopChromiumProject, name: 'chromium' }],
  use: {
    baseURL,
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'on',
  },
  webServer: process.env['BASE_URL']
    ? undefined
    : {
        command: 'npx nx run @codegena/ui-unified:storybook-e2e',
        cwd: workspaceRoot,
        gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
        // Let Playwright stop Storybook before Nx schedules the next task.
        reuseExistingServer: false,
        timeout: 180_000,
        url: storybookUrl,
      },
});
