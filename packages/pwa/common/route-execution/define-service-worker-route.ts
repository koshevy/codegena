import { mapResponseToServiceWorkerRouteResponse }
  from './map-response-to-service-worker-route-response';
import type { ServiceWorkerHttpHandler } from './service-worker-http-handler';
import type { ServiceWorkerRouteHandler } from './service-worker-route-handler';

/**
 * Define a feature API with native Request/Response values. The returned module
 * handler handles worker transport without exposing it to the feature's logic.
 */
export function defineServiceWorkerRoute(
  handler: ServiceWorkerHttpHandler,
): ServiceWorkerRouteHandler {
  return async ({ body, headers, method, url }) => {
    const request = new Request(url, { body, headers, method });
    const response = await handler(request);

    return mapResponseToServiceWorkerRouteResponse(response);
  };
}
