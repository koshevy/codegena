import { serve } from '@hono/node-server';

import { createApp } from './app';
import { environment } from './environment';
import { loadLandingBuild } from './load-landing-build';

async function startServer(): Promise<void> {
  const build = await loadLandingBuild(environment);
  const app = createApp(build);

  serve({
    fetch: app.fetch,
    hostname: environment.hostname,
    port: environment.port,
  });
}

void startServer();
