import { serviceWorkerRegistrationPath } from '@codegena/pwa/common';
import type { MiddlewareHandler } from 'hono';

import { isSameOriginServiceRequest } from './is-same-origin-service-request';

export function createServiceWorkerOriginGuard(origin: string): MiddlewareHandler {
  return async (context, next) => {
    const url = new URL(context.req.url);
    const hasToUseNetwork = context.req.path !== serviceWorkerRegistrationPath && (
      url.origin !== origin || context.req.raw.method === 'HEAD'
    );

    if (hasToUseNetwork) {
      return fetch(context.req.raw);
    }

    if (!isSameOriginServiceRequest(context.req.raw, origin)) {
      return context.json({ error: 'Cross-origin service access is forbidden.' }, 403);
    }

    await next();

    return context.res;
  };
}
