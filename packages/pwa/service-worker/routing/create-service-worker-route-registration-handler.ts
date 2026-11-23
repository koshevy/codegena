import {
  createRouteRegistrationSchema,
  type ServiceWorkerRouteProps,
  type ServiceWorkerRouterOptions,
} from '@codegena/pwa/common';
import type { Context, Handler, Hono } from 'hono';

import { forwardToCompanion } from '../forward-to-companion';

export function createServiceWorkerRouteRegistrationHandler(
  app: Hono,
  { companion, origin }: ServiceWorkerRouterOptions,
): Handler {
  const registrations: ServiceWorkerRouteProps[] = [];

  return async function registerRoute(context: Context): Promise<Response> {
    const contentType = context.req.raw.headers.get('content-type');
    const mediaType = contentType?.split(';')[0].trim().toLowerCase();

    if (mediaType !== 'application/json') {
      return context.json({ error: 'Expected application/json.' }, 415);
    }

    let value: unknown;

    try {
      value = await context.req.json<unknown>();
    }
    catch {
      return context.json({ error: 'Invalid JSON.' }, 400);
    }

    const registration = createRouteRegistrationSchema(origin).safeParse(value);

    if (!registration.success) {
      return context.json({ error: registration.error.issues }, 400);
    }

    const { httpMethod, routeBaseUrl, moduleUrl } = registration.data;

    const previous = registrations.find((route) => (
      route.httpMethod === httpMethod && route.routeBaseUrl === routeBaseUrl
    ));

    if (previous?.moduleUrl === moduleUrl) {
      return context.json(registration.data);
    }

    if (previous) {
      return context.json({ error: 'The method and path are already registered.' }, 409);
    }

    app.on(httpMethod, routeBaseUrl, (requestContext) => (
      forwardToCompanion(companion.port, moduleUrl, requestContext.req.raw)
    ));
    registrations.push(registration.data);

    return context.json(registration.data);
  };
}
