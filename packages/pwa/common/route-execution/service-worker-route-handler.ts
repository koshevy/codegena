import type { ServiceWorkerRouteRequest } from './service-worker-route-request';
import type { ServiceWorkerRouteResponse } from './service-worker-route-response';

/**
 * A context-free feature implementation invoked by the companion for an HTTP
 * route. Only the central Service Worker adapts its request/result data to Hono.
 */
export type ServiceWorkerRouteHandler = (
  request: ServiceWorkerRouteRequest,
) => ServiceWorkerRouteResponse | Promise<ServiceWorkerRouteResponse>;
