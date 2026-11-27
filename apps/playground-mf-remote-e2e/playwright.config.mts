import {
  desktopChromiumProject,
  e2eCommonOptions,
  mobileChromiumProject,
} from '@codegena/util-e2e';
import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:8101';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  expect: { toHaveScreenshot: e2eCommonOptions.screenshots },
  retries: 0,
  workers: 1,
  use: { baseURL, headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm exec -- nx run playground-mf-remote:serve',
    url: baseURL,
    reuseExistingServer: false,
    cwd: workspaceRoot,
  },
  projects: [desktopChromiumProject, mobileChromiumProject],
});
