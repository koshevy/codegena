import { test as base } from '@playwright/test';

import { startBrowserServer } from './start-browser-server';

export const test = base.extend<{
  server: Awaited<ReturnType<typeof startBrowserServer>>;
}>({
  server: async ({ browserName: _browserName }, runTest) => {
    const server = await startBrowserServer();

    try {
      await runTest(server);
    }
    finally {
      await server.close();
    }
  },
});
