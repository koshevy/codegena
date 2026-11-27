import type { BundleWarmupRuntime } from '@codegena/pwa/bundle-warmup-context';
import type { BundleWarmupRequest } from '@codegena/pwa/common';
import { registerServiceWorker } from '@codegena/pwa/service-worker-client';

import { bundleWarmupGroupLimit } from '../common/bundle-warmup-group-limit';

export type BundleWarmupSender = (groups: readonly string[]) => void;

function splitWarmupGroups(groups: readonly string[]): string[][] {
  const batchCount = Math.ceil(groups.length / bundleWarmupGroupLimit);

  return Array.from({ length: batchCount }, (_, batchIndex) => {
    const offset = batchIndex * bundleWarmupGroupLimit;

    return groups.slice(offset, offset + bundleWarmupGroupLimit);
  });
}

export async function connectBundleWarmup({
  buildId,
  manifestPath,
}: BundleWarmupRuntime): Promise<BundleWarmupSender> {
  const worker = await registerServiceWorker(buildId);

  return (groups): void => {
    const batches = splitWarmupGroups(groups);

    batches.forEach((batch) => {
      const request: BundleWarmupRequest = {
        buildId,
        groups: batch,
        manifestPath,
        type: 'warm-bundles',
      };

      worker.postMessage(request, []);
    });
  };
}
