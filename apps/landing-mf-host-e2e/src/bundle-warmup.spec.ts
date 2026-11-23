import { expect, test, type Response } from '@playwright/test';

import { observeLandingDiagnostics, scrollLandingTo } from './landing-journey';

const navigationChunk = /\/navigation-overlay\.[^/]+\.js$/;
const searchChunk = /\/landing-search-preview\.[^/]+\.js$/;
const featureMedia = /\/landing-(?:code-editor|progress-blob|glitch|nebula)\.[^/]+\.js$/;
const remoteEntry = '/playground-remote/remoteEntry.js';

function isWarmedResponse(response: Response, filename: RegExp): boolean {
  return !!response.request().serviceWorker() && filename.test(response.url());
}

test('01.23 — the worker warms bundles and serves the menu from cache', {
  tag: '@production',
}, async ({ context, page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const releaseFeatures = Promise.withResolvers<void>();
  const workerRequests: string[] = [];
  const pageRequests: string[] = [];

  context.on('request', (request) => {
    if (request.serviceWorker()) {
      workerRequests.push(request.url());
    }
  });

  page.on('request', (request) => pageRequests.push(request.url()));

  await context.route('**/landing-features.*.js', async (route) => {
    await releaseFeatures.promise;
    await route.continue();
  });

  // The preview server disables caching. Give this public chunk its deployment header.
  await context.route(navigationChunk, async (route) => {
    const response = await route.fetch();

    await route.fulfill({
      headers: { ...response.headers(), 'cache-control': 'public, max-age=0' },
      response,
    });
  });

  const warmedMenu = context.waitForEvent('response', (response) => (
    isWarmedResponse(response, navigationChunk)
  ));

  const opening = page.goto('/?testingMode=true');

  try {
    await expect(page.getByRole('region', { name: 'Welcome' })).toBeVisible();

    const menuResponse = await warmedMenu;
    const menuUrl = menuResponse.url();

    expect(menuResponse.ok()).toBe(true);
    await expect.poll(() => (
      page.evaluate(async (url) => !!await caches.match(url), menuUrl)
    )).toBe(true);
    expect(pageRequests).not.toContain(menuUrl);
    expect(workerRequests.some((url) => searchChunk.test(url))).toBe(false);
    expect(workerRequests.some((url) => url.endsWith(remoteEntry))).toBe(false);

    const warmedSearch = context.waitForEvent('response', (response) => (
      isWarmedResponse(response, searchChunk)
    ));

    const warmedPlayground = context.waitForEvent('response', (response) => (
      !!response.request().serviceWorker() && response.url().endsWith(remoteEntry)
    ));

    releaseFeatures.resolve();

    const responses = await Promise.all([warmedSearch, warmedPlayground]);

    expect(responses.every((response) => response.ok())).toBe(true);
    expect(pageRequests.some((url) => searchChunk.test(url))).toBe(false);
    expect(workerRequests.some((url) => featureMedia.test(url))).toBe(false);
    expect(pageRequests.some((url) => featureMedia.test(url))).toBe(false);
    expect(pageRequests.some((url) => url.endsWith(remoteEntry))).toBe(false);
    expect(pageRequests.some((url) => url.endsWith('/assets/github-search-graph.json')))
      .toBe(false);

    await context.unrouteAll({ behavior: 'wait' });
    await scrollLandingTo(page, 120);

    const servedMenu = page.waitForResponse(menuUrl);

    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Navigation drawer' }))
      .toBeVisible();

    const menuScript = await servedMenu;

    expect(menuScript.fromServiceWorker()).toBe(true);
    expect(workerRequests.filter((url) => url === menuUrl)).toHaveLength(1);
    expectNoDiagnostics();
  }
  finally {
    releaseFeatures.resolve();
    await opening;
  }
});
