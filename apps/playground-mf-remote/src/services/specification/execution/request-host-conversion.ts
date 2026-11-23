import {
  type z,
} from 'zod';

import {
  conversionWorkerInputSchema,
  conversionWorkerResultSchema,
  getConversionChannelName,
} from '../conversion-channel';

/**
 * Exchange one conversion with the tab-owned worker. SharedWorkerGlobalScope
 * cannot construct a Worker; the page retains the handle needed to terminate it.
 */
export async function requestHostConversion(
  id: string,
  input: z.infer<typeof conversionWorkerInputSchema>,
  signal: AbortSignal,
): Promise<string> {
  signal.throwIfAborted();

  const channel = new BroadcastChannel(getConversionChannelName(id));
  const { promise, resolve, reject } = Promise.withResolvers<string>();

  const cancel = (): void => reject(signal.reason);

  channel.onmessage = (event: MessageEvent<unknown>): void => {
    const result = conversionWorkerResultSchema.safeParse(event.data);

    if (!result.success) {
      reject(new Error('Invalid conversion worker result.'));
      return;
    }

    if ('error' in result.data) {
      reject(new Error(result.data.error));
      return;
    }

    resolve(result.data.serializedGraph);
  };

  channel.onmessageerror = (): void => reject(new Error('Conversion reply failed.'));
  signal.addEventListener('abort', cancel, { once: true });

  try {
    channel.postMessage(input);

    return await promise;
  }
  finally {
    signal.removeEventListener('abort', cancel);
    channel.close();
  }
}
