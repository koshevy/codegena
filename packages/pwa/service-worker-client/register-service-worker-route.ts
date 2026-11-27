import type { ServiceWorkerRouteProps } from '@codegena/pwa/common';
import {
  createRouteRegistrationSchema,
  serviceWorkerRegistrationPath,
} from '@codegena/pwa/common';

export async function registerServiceWorkerRoute(
  registration: ServiceWorkerRouteProps,
): Promise<void> {
  if (!navigator.serviceWorker.controller) {
    throw new Error('The page must be controlled by the PWA Service Worker.');
  }

  const schema = createRouteRegistrationSchema(globalThis.location.origin);
  const validated = schema.parse(registration);

  const response = await fetch(serviceWorkerRegistrationPath, {
    body: JSON.stringify(validated),
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    mode: 'same-origin',
    redirect: 'error',
  });

  if (!response.ok) {
    throw new Error(`Service Worker route registration failed (${response.status}).`);
  }

  const result: unknown = await response.json();

  schema.parse(result);
}
