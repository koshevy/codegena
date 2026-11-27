import { z } from 'zod';

import { serviceWorkerRouteHeadersSchema } from './service-worker-route-headers';

/**
 * HTTP result returned by a route implementation in the companion. The central
 * Service Worker reconstructs a native Response from these transferable fields.
 */
export const serviceWorkerRouteResponseSchema = z.strictObject({
  body: z.instanceof(ArrayBuffer).nullable(),
  headers: serviceWorkerRouteHeadersSchema,
  status: z.number().int().min(200).max(599),
  statusText: z.string(),
});

export type ServiceWorkerRouteResponse = z.infer<typeof serviceWorkerRouteResponseSchema>;
