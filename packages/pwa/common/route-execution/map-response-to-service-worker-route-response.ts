import type { ServiceWorkerRouteResponse } from './service-worker-route-response';

/**
 * Read a native Response into plain data that can cross worker ports. A route
 * implementation returns this value; the Service Worker recreates the Response.
 */
export async function mapResponseToServiceWorkerRouteResponse(
  response: Response,
): Promise<ServiceWorkerRouteResponse> {
  return {
    body: response.body ? await response.arrayBuffer() : null,
    headers: [...response.headers],
    status: response.status,
    statusText: response.statusText,
  };
}
