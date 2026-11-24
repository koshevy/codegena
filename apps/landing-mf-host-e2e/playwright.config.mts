import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['BASE_URL'] ?? 'http://localhost:8103';
const chromiumExecutablePath = process.env['LANDING_E2E_CHROMIUM'];
const previewUrl = new URL(baseURL);
const previewPort = previewUrl.port || '8103';
const serverTarget = process.env['LANDING_E2E_SERVER'] === 'development'
  ? 'serve:e2e'
  : 'serve-static';
const excludedBuildCases = serverTarget === 'serve:e2e' ? [/@production/] : [];

const nativePreviewCommand = [
  `npm exec -- nx run landing-mf-host:${serverTarget}`,
  `--port=${previewPort}`,
].join(' ');
const containerPreviewCommand = [
  'node_modules/.bin/http-server dist/apps/landing-mf-host -c-1',
  `-a localhost -p ${previewPort} -P "http://localhost:${previewPort}?"`,
].join(' ');
const hasContainerBrowser = Boolean(chromiumExecutablePath);
const previewCommand = hasContainerBrowser
  ? containerPreviewCommand
  : nativePreviewCommand;
const isStaticPreview = serverTarget === 'serve-static';
const isNxStaticServer = !hasContainerBrowser && isStaticPreview;

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  workers: 2,
  use: {
    baseURL,
    launchOptions: { executablePath: chromiumExecutablePath },
    trace: 'on-first-retry',
  },
  webServer: {
    command: previewCommand,
    cwd: workspaceRoot,
    // The SPA file server cleans up twice on SIGTERM; SIGINT exits it once.
    gracefulShutdown: {
      signal: isNxStaticServer ? 'SIGINT' : 'SIGTERM',
      timeout: 5000,
    },
    reuseExistingServer: false,
    url: baseURL,
  },
  projects: [
    {
      name: 'desktop',
      grepInvert: [/@mobile-peel/, ...excludedBuildCases],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iPhone 15',
      grepInvert: [
        /@desktop-touchpad|@desktop-menu|@desktop-foldering/,
        ...excludedBuildCases,
      ],
      use: {
        ...devices['iPhone 15'],
        browserName: 'chromium',
        // Match the engine: Safari's user agent triggers Monaco's WebKit path.
        userAgent: devices['Pixel 7'].userAgent,
      },
    },
  ],
});
