import {
  clientShellBuildHeader,
  createSameOriginUrlSchema,
} from '@codegena/pwa/common';
import type { ExecutionContext } from 'hono';

import { hasCachedClientShell, storeClientShellFiles } from './client-shell-cache';

const fileDestinations = new Set<RequestDestination>([
  'font',
  'image',
  'script',
  'style',
]);
const cacheForbidden = /(?:^|,)\s*(?:no-cache|no-store|private)\b/i;
const publicCache = /(?:^|,)\s*public\b/i;

interface ServiceWorkerFileCache {
  fetchNetwork: (request: Request, context: ExecutionContext) => Promise<Response>;
  flushPreviousBuilds: () => Promise<void>;
  warmAssets: (
    files: readonly string[],
    clientShellFiles?: readonly string[],
  ) => Promise<void>;
}

function isHomeNavigation(request: Request, origin: string): boolean {
  const url = new URL(request.url);

  return request.method === 'GET'
    && request.mode === 'navigate'
    && request.destination === 'document'
    && url.origin === origin
    && url.pathname === '/';
}

function isCacheableFile(request: Request, origin: string): boolean {
  const requestUrl = new URL(request.url);

  return request.method === 'GET'
    && fileDestinations.has(request.destination)
    && requestUrl.origin === origin
    && request.cache !== 'no-store'
    && !request.headers.has('Authorization')
    && !request.headers.has('Range');
}

async function tryCacheOperation<T>(operation: Promise<T>): Promise<T | null> {
  try {
    return await operation;
  }
  catch {
    // Network requests and worker activation can continue without the cache.
    return null;
  }
}

function canStoreFile(response: Response): boolean {
  const cacheControl = response.headers.get('Cache-Control') ?? '';
  const contentType = response.headers.get('Content-Type') ?? '';
  const vary = response.headers.get('Vary');

  return response.status === 200
    && response.type === 'basic'
    && !response.redirected
    && !!contentType
    && !contentType.includes('html')
    && !vary?.includes('*')
    && publicCache.test(cacheControl)
    && !cacheForbidden.test(cacheControl);
}

/**
 * Cache public static responses for one build within this registration's scope.
 * The network stays available when Cache Storage is unavailable or full.
 */
export function createServiceWorkerFileCache(
  scope: string,
  buildId: string,
): ServiceWorkerFileCache {
  const { origin } = new URL(scope);
  const cachePrefix = `codegena-files:${encodeURIComponent(scope)}:`;
  const cacheName = `${cachePrefix}${encodeURIComponent(buildId)}`;
  const sameOriginUrl = createSameOriginUrlSchema(origin);

  async function warmAssets(
    files: readonly string[],
    clientShellFiles?: readonly string[],
  ): Promise<void> {
    const cache = await tryCacheOperation(caches.open(cacheName));

    if (!cache) {
      return;
    }

    if (clientShellFiles) {
      await tryCacheOperation(storeClientShellFiles(cache, origin, clientShellFiles));
    }

    for (const file of files) {
      const url = sameOriginUrl.safeParse(file);

      if (!url.success || !/\.(?:js|css)$/.test(url.data.pathname)) {
        continue;
      }

      const request = new Request(url.data.href, {
        cache: 'no-cache',
        credentials: 'omit',
        mode: 'same-origin',
        priority: 'low',
        redirect: 'error',
      });

      const cached = await tryCacheOperation(cache.match(request));

      if (cached) {
        continue;
      }

      const response = await tryCacheOperation(fetch(request));

      if (response && canStoreFile(response)) {
        await tryCacheOperation(cache.put(request, response));
      }
    }
  }

  async function fetchHome(request: Request): Promise<Response> {
    const cache = await tryCacheOperation(caches.open(cacheName));
    const isClientShellReady = cache && await tryCacheOperation(
      hasCachedClientShell(cache, origin),
    );

    if (!isClientShellReady) {
      return fetch(request);
    }

    const headers = new Headers(request.headers);

    headers.set(clientShellBuildHeader, buildId);

    return fetch(request, { headers });
  }

  async function fetchNetwork(
    request: Request,
    context: ExecutionContext,
  ): Promise<Response> {
    if (isHomeNavigation(request, origin)) {
      return fetchHome(request);
    }

    if (!isCacheableFile(request, origin)) {
      return fetch(request);
    }

    const cache = await tryCacheOperation(caches.open(cacheName));

    if (!cache) {
      return fetch(request);
    }

    const shouldRefresh = request.cache === 'reload' || request.cache === 'no-cache';

    if (!shouldRefresh) {
      const cached = await tryCacheOperation(cache.match(request));

      if (cached) {
        return cached;
      }
    }

    // Revalidate stable file URLs against the server after a build change.
    const response = await fetch(request, { cache: 'no-cache' });

    const cacheChange = canStoreFile(response)
      ? cache.put(request, response.clone())
      : cache.delete(request);

    context.waitUntil(tryCacheOperation<void | boolean>(cacheChange));

    return response;
  }

  async function flushPreviousBuilds(): Promise<void> {
    const cacheNames = await tryCacheOperation(caches.keys());
    const previousBuilds = (cacheNames ?? []).filter((name) => (
      name.startsWith(cachePrefix) && name !== cacheName
    ));

    await Promise.all(previousBuilds.map((name) => (
      tryCacheOperation(caches.delete(name))
    )));
  }

  return { fetchNetwork, flushPreviousBuilds, warmAssets };
}
