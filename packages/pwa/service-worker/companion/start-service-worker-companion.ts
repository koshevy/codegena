import type { CompanionExecutionResponse } from '@codegena/pwa/common';

import { handleCompanionRequest } from './handle-companion-request';

/**
 * Run feature modules in a SharedWorker, where dynamic import is supported.
 * The page transfers its connection port to the central Service Worker.
 */
export function startServiceWorkerCompanion(): void {
  const origin = globalThis.location.origin;

  globalThis.addEventListener('connect', (event) => {
    if (!(event instanceof MessageEvent)) {
      return;
    }

    const [port] = event.ports;

    if (!port) {
      return;
    }

    port.onmessage = async (message: MessageEvent<unknown>): Promise<void> => {
      const [reply] = message.ports;

      if (!reply) {
        return;
      }

      try {
        const result = await handleCompanionRequest(message.data, origin);
        const response: CompanionExecutionResponse = { result };

        reply.postMessage(response, []);
      }
      catch (error) {
        const detail = error instanceof Error
          ? error.message
          : 'Companion execution failed.';
        const response: CompanionExecutionResponse = { error: detail };

        reply.postMessage(response, []);
      }
      finally {
        reply.close();
      }
    };

    port.start();
  });
}
