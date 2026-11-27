import type { ExecutionContext } from 'hono';

import type { ServiceWorkerCompanionConnection } from './companion';

/**
 * Configuration for the central HTTP router. Its companion connection is owned
 * and updated by the Service Worker's message listener.
 */
export interface ServiceWorkerRouterOptions {
  companion: ServiceWorkerCompanionConnection;
  fetchNetwork?: (request: Request, context: ExecutionContext) => Promise<Response>;
  origin: string;
}
