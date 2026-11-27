import { devices, type PlaywrightTestProject } from '@playwright/test';

/**
 * Chromium with Playwright's desktop viewport and user agent.
 */
export const desktopChromiumProject = {
  name: 'desktop',
  use: { ...devices['Desktop Chrome'] },
} satisfies PlaywrightTestProject;

/**
 * Chromium with iPhone 15 dimensions and touch settings.
 */
export const mobileChromiumProject = {
  name: 'iPhone 15',
  use: {
    ...devices['iPhone 15'],
    browserName: 'chromium',
    // Match the engine: Safari's user agent triggers Monaco's WebKit path.
    userAgent: devices['Pixel 7'].userAgent,
  },
} satisfies PlaywrightTestProject;
