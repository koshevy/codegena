import {
  serviceWorkerRegistrationPath,
  type ServiceWorkerRouterOptions,
} from '@codegena/pwa/common';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { HTTPException } from 'hono/http-exception';
import { TrieRouter } from 'hono/router/trie-router';

import { createServiceWorkerOriginGuard } from './create-service-worker-origin-guard';
import {
  createServiceWorkerRouteRegistrationHandler,
} from './create-service-worker-route-registration-handler';

/**
 * TrieRouter accepts new routes after /_register has handled a request.
 * Each registered path is literal; feature execution is delegated to the companion.
 */
export function createServiceWorkerRouter({
  companion,
  fetchNetwork,
  origin,
}: ServiceWorkerRouterOptions): Hono {
  const app = new Hono({ router: new TrieRouter() });
  const url = new URL(origin);
  const workerOrigin = url.origin;

  app.use('*', createServiceWorkerOriginGuard(workerOrigin));

  app.post(
    serviceWorkerRegistrationPath,
    bodyLimit({ maxSize: 4096 }),
    createServiceWorkerRouteRegistrationHandler(app, { companion, origin: workerOrigin }),
  );

  app.all(serviceWorkerRegistrationPath, (context) => (
    context.json({ error: 'Use POST to register a route.' }, 405)
  ));

  app.notFound((context) => (
    fetchNetwork
      ? fetchNetwork(context.req.raw, context.executionCtx)
      : fetch(context.req.raw)
  ));

  app.onError((error, context) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }

    return context.json({ error: error.message }, 502);
  });

  return app;
}
