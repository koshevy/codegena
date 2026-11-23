import { conversionWorkerReadySchema } from '../conversion-channel';

export async function openConversionWorker(
  id: string,
  signal: AbortSignal,
  appBuildId: string,
): Promise<Worker> {
  signal.throwIfAborted();

  const url = new URL('/specification-conversion-worker.js', globalThis.location.origin);

  url.searchParams.set('buildId', appBuildId);

  const worker = new Worker(url, {
    type: 'module',
  });

  const startup = AbortSignal.any([signal, AbortSignal.timeout(10_000)]);
  const { promise, resolve, reject } = Promise.withResolvers<Worker>();

  const cancel = (): void => reject(startup.reason);
  const fail = (event: ErrorEvent): void => reject(new Error(event.message));

  const ready = (event: MessageEvent<unknown>): void => {
    const result = conversionWorkerReadySchema.safeParse(event.data);

    if (result.success) {
      resolve(worker);
    }
    else {
      reject(new Error('Conversion worker did not initialize.'));
    }
  };

  worker.addEventListener('message', ready);
  worker.addEventListener('error', fail);
  startup.addEventListener('abort', cancel, { once: true });
  worker.postMessage({ id });

  try {
    return await promise;
  }
  catch (error) {
    worker.terminate();

    throw error;
  }
  finally {
    worker.removeEventListener('message', ready);
    worker.removeEventListener('error', fail);
    startup.removeEventListener('abort', cancel);
  }
}
