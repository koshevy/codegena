/// <reference lib="webworker" />

import { mapGraphPayloadToWorkerPayload } from '@codegena/graph-core';

import { convertSourceToGraph } from './convert-source-to-graph';
import type {
  GraphConversionWorkerRequest,
  GraphConversionWorkerResponse,
} from './graph-conversion-worker-message';

/**
 * Install the one-shot conversion handler in a dedicated Web Worker entry.
 */
export function startGraphConversionWorker(): void {
  globalThis.addEventListener('message', (
    event: MessageEvent<GraphConversionWorkerRequest>,
  ) => {
    if (event.data.type !== 'convert') {
      return;
    }

    void convertSourceToGraph(event.data.input)
      .then((graph) => {
        const response: GraphConversionWorkerResponse = {
          graph: mapGraphPayloadToWorkerPayload(graph),
          type: 'converted',
        };

        globalThis.postMessage(response);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error
          ? error.message
          : 'Specification conversion failed.';

        const response: GraphConversionWorkerResponse = {
          message,
          type: 'failed',
        };

        globalThis.postMessage(response);
      });
  });
}
