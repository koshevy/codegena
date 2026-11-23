import {
  type CompanionConnectionRequest,
  companionConnectionRequestType,
  companionConnectionResponseSchema,
  createSameOriginUrlSchema,
  exchangeWorkerMessage,
} from '@codegena/pwa/common';

/**
 * Call from a controlled page after the central Service Worker is active.
 * Create the SharedWorker, request attachment of its port, and await confirmation
 * from the Service Worker's message listener before registering feature routes.
 * Resolves after attachment; the active page owns the companion's lifetime.
 * The target is a specific worker, so a concurrent update cannot redirect the port.
 */
export async function requestServiceWorkerCompanionConnection(
  worker: ServiceWorker,
  companionUrl: string,
): Promise<void> {
  const hasControl = worker.state === 'activated'
    && navigator.serviceWorker.controller === worker;

  if (!hasControl) {
    throw new Error('The central Service Worker no longer controls the page.');
  }

  const url = createSameOriginUrlSchema(globalThis.location.origin).parse(companionUrl);
  const companion = new SharedWorker(url.href, {
    type: 'module',
  });

  const request: CompanionConnectionRequest = {
    type: companionConnectionRequestType,
  };

  const reply = await exchangeWorkerMessage(worker, request, [
    companion.port,
  ]);

  companionConnectionResponseSchema.parse(reply);
}
