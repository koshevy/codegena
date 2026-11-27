import type { ServiceWorkerRouteRequest } from './service-worker-route-request';
import { serviceWorkerRouteRequestSchema } from './service-worker-route-request';

/**
 * Read the request body once in the Service Worker and prepare the plain argument
 * passed to a registered implementation through the companion's execution call.
 */
export async function mapRequestToServiceWorkerRouteRequest(
  request: Request,
): Promise<ServiceWorkerRouteRequest> {
  return serviceWorkerRouteRequestSchema.parse({
    body: request.body ? await request.arrayBuffer() : null,
    headers: [...request.headers],
    method: request.method,
    url: request.url,
  });
}
