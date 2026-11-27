import type { GraphPayload } from '@codegena/graph-core';

import type { ConvertSourceToGraphProps } from './convert-source-to-graph';
import type {
  GraphConversionWorkerRequest,
  GraphConversionWorkerResponse,
} from './graph-conversion-worker-message';

export interface ConvertSourceToGraphInWorkerProps extends ConvertSourceToGraphProps {
  signal?: AbortSignal;
  worker: Worker;
}

/**
 * Run one conversion in a caller-owned worker and release it afterward.
 */
export function convertSourceToGraphInWorker({
  signal,
  worker,
  ...input
}: ConvertSourceToGraphInWorkerProps): Promise<GraphPayload> {
  if (signal?.aborted) {
    worker.terminate();
    return Promise.reject(new DOMException('Conversion cancelled.', 'AbortError'));
  }

  return new Promise((resolve, reject) => {
    const cleanup = (): void => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      signal?.removeEventListener('abort', handleAbort);
      worker.terminate();
    };

    const handleMessage = ({
      data,
    }: MessageEvent<GraphConversionWorkerResponse>): void => {
      cleanup();

      if (data.type === 'converted') {
        resolve(data.graph);
        return;
      }

      reject(new Error(data.message));
    };

    const handleError = (error: ErrorEvent): void => {
      cleanup();
      reject(new Error(error.message));
    };

    const handleAbort = (): void => {
      cleanup();
      reject(new DOMException('Conversion cancelled.', 'AbortError'));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
    signal?.addEventListener('abort', handleAbort, { once: true });

    const request: GraphConversionWorkerRequest = {
      input,
      type: 'convert',
    };

    worker.postMessage(request);
  });
}
