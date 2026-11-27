import type {
  CompanionConnectionResponse,
  ServiceWorkerCompanionConnection,
  ServiceWorkerRouterOptions,
} from '@codegena/pwa/common';
import { fire } from '@hono/service-worker';

import { readCompanionConnectionRequest } from './read-companion-connection-request';
import { createServiceWorkerRouter } from './routing';

/**
 * Install the HTTP router and connection listener inside the Service Worker.
 * The page then calls requestServiceWorkerCompanionConnection to attach a port;
 * this listener owns port replacement and sends the connection confirmation.
 */
export function startServiceWorker(
  fetchNetwork?: ServiceWorkerRouterOptions['fetchNetwork'],
): void {
  const origin = globalThis.location.origin;
  const companion: ServiceWorkerCompanionConnection = {};
  const app = createServiceWorkerRouter({ companion, fetchNetwork, origin });

  globalThis.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (event.origin !== origin) {
      return;
    }

    const connection = readCompanionConnectionRequest(event.data, event.ports);

    if (!connection) {
      return;
    }

    companion.port?.close();
    companion.port = connection.companionPort;
    companion.port.start();

    const response: CompanionConnectionResponse = { connected: true };

    try {
      connection.replyPort.postMessage(response, []);
    }
    finally {
      connection.replyPort.close();
    }
  });

  // The router owns network fallback; a handler's 404 must remain its own response.
  fire(app, {});
}
