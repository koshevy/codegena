import { createSameOriginUrlSchema } from '@codegena/pwa/common';

import { openConversionWorker } from './open-conversion-worker';
import { specificationApiPath } from '../specification-contract';
import { startSpecificationJob } from './start-specification-job';
import { waitForConvertedSpecification } from './wait-for-converted-specification';

export async function loadSpecification(
  specUrl: string,
  signal: AbortSignal,
  appBuildId: string,
): Promise<unknown> {
  const url = createSameOriginUrlSchema(globalThis.location.origin).parse(specUrl);
  const id = crypto.randomUUID();
  const worker = await openConversionWorker(id, signal, appBuildId);
  const resultUrl = `${specificationApiPath}?${new URLSearchParams({ id })}`;
  const terminate = (): void => worker.terminate();

  signal.addEventListener('abort', terminate, { once: true });

  try {
    signal.throwIfAborted();

    // Await acknowledgement before cancelling the API job. Its dedicated worker
    // is terminated immediately even if this short start request is still pending.
    await startSpecificationJob({ id, specUrl: url.href });

    return await waitForConvertedSpecification(resultUrl, signal);
  }
  finally {
    signal.removeEventListener('abort', terminate);
    worker.terminate();
    await fetch(resultUrl, { method: 'DELETE' });
  }
}
