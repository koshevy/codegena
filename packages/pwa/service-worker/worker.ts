/// <reference lib="webworker" />
import {
  createServiceWorkerFileCache,
  startServiceWorker,
} from '@codegena/pwa/service-worker';

import { warmBundleGroups } from './warm-bundle-groups';

declare const self: ServiceWorkerGlobalScope;

const location = new URL(self.location.href);
const buildId = location.searchParams.get('buildId');
const fileCache = buildId
  ? createServiceWorkerFileCache(self.registration.scope, buildId)
  : undefined;

startServiceWorker(fileCache?.fetchNetwork);

if (buildId && fileCache) {
  self.addEventListener('message', (event) => {
    if (event.origin !== location.origin) {
      return;
    }

    event.waitUntil(warmBundleGroups(event.data, buildId, fileCache.warmAssets));
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

async function activateWorker(): Promise<void> {
  await fileCache?.flushPreviousBuilds();
  await self.clients.claim();
}

self.addEventListener('activate', (event) => event.waitUntil(activateWorker()));
