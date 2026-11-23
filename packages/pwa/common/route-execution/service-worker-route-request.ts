import { z } from 'zod';

import { serviceWorkerRouteHeadersSchema } from './service-worker-route-headers';
import { serviceWorkerRoutePropsSchema } from '../service-worker-route-props';

/**
 * Snapshot of a registered route's HTTP request, passed as the implementation's
 * first argument. Its byte body and header pairs can cross worker ports.
 */
export const serviceWorkerRouteRequestSchema = z.strictObject({
  body: z.instanceof(ArrayBuffer).nullable(),
  headers: serviceWorkerRouteHeadersSchema,
  method: serviceWorkerRoutePropsSchema.shape.httpMethod,
  url: z.string(),
});

export type ServiceWorkerRouteRequest = z.infer<typeof serviceWorkerRouteRequestSchema>;
