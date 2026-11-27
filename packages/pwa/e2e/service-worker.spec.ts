import { expect, type Page } from '@playwright/test';

import { test } from './__mocks__';

async function activateHistoryRoute(page: Page, buildId?: string): Promise<void> {
  await page.evaluate(async (id) => {
    const clientUrl = '/client.js';
    const client: typeof import('./__mocks__/client') = (
      await import(clientUrl)
    );

    await client.activateHistoryRoute(id);
  }, buildId);
}

test('keeps the same build usable after repeated setup and page reload', async ({
  page,
  server,
}) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      errors.push(message.text());
    }
  });

  await page.goto(server.url);
  await activateHistoryRoute(page);
  await activateHistoryRoute(page);
  await page.reload();
  await activateHistoryRoute(page);

  const result: unknown = await page.evaluate(async () => {
    const response = await fetch('/services/history', { method: 'POST' });

    return response.json();
  });

  expect(result).toEqual({ service: 'history', path: '/services/history' });
  expect(errors).toEqual([]);
});

test('replaces the controller and companion module state when the build changes', async ({
  page,
  server,
}) => {
  await page.goto(server.url);
  await activateHistoryRoute(page, 'build-1');

  const visit = async (): Promise<unknown> => page.evaluate(async () => {
    const response = await fetch('/services/history?visit=1', { method: 'POST' });

    return response.json();
  });

  expect(await visit()).toEqual({ visits: 1 });
  await activateHistoryRoute(page, 'build-1');
  expect(await visit()).toEqual({ visits: 2 });

  const previous = await page.evaluate(() => (
    navigator.serviceWorker.controller?.scriptURL
  ));

  await activateHistoryRoute(page, 'build-2');

  const current = await page.evaluate(() => (
    navigator.serviceWorker.controller?.scriptURL
  ));
  const registrations = await page.evaluate(async () => {
    const entries = await navigator.serviceWorker.getRegistrations();

    return entries.length;
  });

  expect(previous).toBe(`${server.url}/service-worker.js?buildId=build-1`);
  expect(current).toBe(`${server.url}/service-worker.js?buildId=build-2`);
  expect(registrations).toBe(1);
  expect(await visit()).toEqual({ visits: 1 });
});

test('retains public files within a build and flushes them on replacement', async ({
  page,
  server,
}) => {
  await page.goto(server.url);
  await activateHistoryRoute(page, 'asset-build-1');
  await page.evaluate(() => caches.open('unrelated-cache'));

  const assetUrl = '/public-asset.js';
  const document = page.locator('body');

  await page.addScriptTag({ url: assetUrl });
  await expect(document).toHaveAttribute('data-asset-version', '1');
  await expect.poll(() => page.evaluate(async (path) => (
    !!await caches.match(path)
  ), assetUrl)).toBe(true);

  await page.addScriptTag({ url: assetUrl });
  await expect(document).toHaveAttribute('data-asset-version', '1');

  await activateHistoryRoute(page, 'asset-build-2');

  const retainedAssets = await page.evaluate(() => caches.keys());

  expect(retainedAssets).toEqual(['unrelated-cache']);
  await page.addScriptTag({ url: assetUrl });
  await expect(document).toHaveAttribute('data-asset-version', '2');
});

test('serves a feature API without retaining a worker handle', async ({
  context,
  page,
  server,
}) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(server.url);
  await activateHistoryRoute(page);

  const session = await context.newCDPSession(page);

  await session.send('HeapProfiler.collectGarbage');

  const result: unknown = await page.evaluate(async () => {
    const response = await fetch('/services/history', { method: 'POST' });

    return response.json();
  });
  const network = await page.evaluate(async () => {
    const response = await fetch('/unrelated-asset');

    return response.text();
  });

  expect(result).toEqual({ service: 'history', path: '/services/history' });
  expect(network).toContain('Network');
  expect(errors).toEqual([]);
});

test('accepts route registration again after its worker restarts', async ({
  page,
  context,
  server,
}) => {
  await page.goto(server.url);
  await activateHistoryRoute(page);

  const session = await context.newCDPSession(page);

  await session.send('ServiceWorker.enable');
  await session.send('ServiceWorker.stopAllWorkers');
  await activateHistoryRoute(page);

  const result: unknown = await page.evaluate(async () => {
    const response = await fetch('/services/history', { method: 'POST' });

    return response.json();
  });

  expect(result).toEqual({ service: 'history', path: '/services/history' });
});

test('waits for the replacement worker before registering a feature API', async ({
  page,
  server,
}) => {
  await page.goto(server.url);
  await activateHistoryRoute(page);
  server.updateWorker();

  const result = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const updateFound = new Promise<void>((resolve) => {
      registration.addEventListener('updatefound', () => resolve(), { once: true });
    });

    const updating = registration.update();

    await updateFound;

    const initialState = registration.installing?.state;
    const clientUrl = '/client.js';
    const client: typeof import('./__mocks__/client') = await import(clientUrl);

    await client.activateHistoryRoute();
    await updating;

    const response = await fetch('/services/history', { method: 'POST' });

    return { initialState, body: await response.json() };
  });

  expect(result).toEqual({
    initialState: 'installing',
    body: { service: 'history', path: '/services/history' },
  });
});

test('keeps handler 404 responses local to the pseudo-backend', async ({
  page,
  server,
}) => {
  await page.goto(server.url);
  await activateHistoryRoute(page);

  const result = await page.evaluate(async () => {
    const response = await fetch('/services/history?missing=1', { method: 'POST' });

    return { status: response.status, body: await response.json() };
  });

  expect(result).toEqual({ status: 404, body: { error: 'No visit found.' } });
});

test('returns an execution error through the companion message boundary', async ({
  page,
  server,
}) => {
  await page.goto(server.url);
  await activateHistoryRoute(page);

  const result = await page.evaluate(async () => {
    const response = await fetch('/services/history?fail=1', { method: 'POST' });

    return { status: response.status, body: await response.json() };
  });

  expect(result).toEqual({ status: 500, body: { error: 'History is unavailable.' } });
});

test('matches literal routes and keeps concurrent replies with their requests', async ({
  page,
  server,
}) => {
  await page.goto(server.url);
  await activateHistoryRoute(page);

  const results: unknown[] = await page.evaluate(async () => (
    Promise.all(Array.from({ length: 12 }, async (_, index) => {
      const response = await fetch(`/services/history?echo=1&id=${index}`, {
        body: `request-${index}`,
        method: 'POST',
      });

      return response.json();
    }))
  ));

  expect(results).toEqual(Array.from({ length: 12 }, (_, index) => ({
    body: `request-${index}`,
    id: String(index),
    method: 'POST',
    worker: 'SharedWorkerGlobalScope',
  })));

  const nonmatching = await page.evaluate(async () => {
    const response = await fetch('/services/history/child', { method: 'POST' });
    const anotherMethod = await fetch('/services/history');

    return [await response.text(), await anotherMethod.text()];
  });

  expect(nonmatching.every((result) => result.includes('Network'))).toBe(true);
});

test('preserves binary response bodies and status through the companion', async ({
  page,
  server,
}) => {
  await page.goto(server.url);
  await activateHistoryRoute(page);

  const result = await page.evaluate(async () => {
    const response = await fetch('/services/history?binary=1', { method: 'POST' });
    const body = await response.arrayBuffer();

    return {
      body: [...new Uint8Array(body)],
      contentType: response.headers.get('content-type'),
      status: response.status,
    };
  });

  expect(result).toEqual({
    body: [0, 127, 255],
    contentType: 'application/octet-stream',
    status: 206,
  });
});

test('executes opaque parameters without an HTTP or Hono context', async ({
  page,
  server,
}) => {
  await page.goto(server.url);

  const result: unknown = await page.evaluate(async () => {
    const clientUrl = '/client.js';
    const client: typeof import('./__mocks__/client') = await import(clientUrl);

    return client.executeOpaqueExample();
  });

  expect(result).toEqual({ result: 42 });
});
