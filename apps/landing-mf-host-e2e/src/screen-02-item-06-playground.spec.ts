import { expect, test } from '@playwright/test';

import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
  waitForPlaygroundIllustration,
} from './landing-journey';

const examples = [
  {
    label: 'Simplest pet store',
    query: 'Pet',
    result: /^Pet\b/,
    specUrl: '/specifications/pet-store.json',
    title: 'Swagger Petstore',
  },
  {
    label: '1Password small API set (67 declarations)',
    query: 'ApiRequest',
    result: /^ApiRequest\b/,
    specUrl: '/specifications/one-password.json',
    title: '1Password Connect',
  },
  {
    label: 'Edge case for GitHub (5000+ declarations)',
    query: 'PublicEvent',
    result: /^PublicEvent\b/,
    specUrl: '/specifications/github.json',
    title: 'GitHub v3 REST API',
  },
] as const;

examples.forEach(({ label, query, result, specUrl, title }) => {
  test(`02.06 — opens ${title} in the federated Playground`, async ({ page }) => {
    test.setTimeout(120_000);

    const expectNoDiagnostics = observeLandingDiagnostics(page);

    await page.goto('/?testingMode=true');
    await scrollSecondScreenTo(page, 15.5 / 17);
    await waitForPlaygroundIllustration(page);

    const landingUrl = page.url();
    const button = page.getByRole('button', { name: label, exact: true });

    const converted = page.waitForResponse((candidate) => {
      const url = new URL(candidate.url());

      return url.pathname === '/api/specification'
        && candidate.request().method() === 'GET'
        && candidate.status() === 200;
    }, { timeout: 90_000 });

    const started = page.waitForResponse((candidate) => {
      const url = new URL(candidate.url());

      return url.pathname === '/api/specification'
        && candidate.request().method() === 'POST';
    });

    await button.click();

    const overlay = page.getByRole('dialog', { name: `${label} demo` });

    await expect(overlay).toBeVisible();

    const [
      startResponse,
      response,
    ] = await Promise.all([
      started,
      converted,
      expect(overlay.getByRole('button', {
        name: 'Search in files and directories',
      })).toBeVisible({ timeout: 90_000 }),
    ]);

    const playgroundUrl = new URL(
      `/playground/${encodeURIComponent(specUrl)}`,
      landingUrl,
    );

    const originalUrl = new URL(landingUrl);

    playgroundUrl.search = originalUrl.search;

    await expect(page).toHaveURL(playgroundUrl.href);

    const request = startResponse.request();
    const conversionInput: unknown = request.postDataJSON();
    const expectedSpec = new URL(specUrl, landingUrl);

    expect(conversionInput).toMatchObject({
      specUrl: expectedSpec.href,
    });
    expect(response.fromServiceWorker()).toBe(true);

    await overlay.getByRole('button', {
      name: 'Search in files and directories',
    }).click();

    const search = page.getByRole('combobox');

    await expect(search).toBeFocused();
    await search.fill(query);
    await expect(page.getByRole('option', {
      name: result,
    })).toBeVisible();
    await search.press('Escape');
    await expect(overlay).toBeVisible();

    await overlay.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.getByRole('link', { name: 'Return to landing', exact: true }).click();
    await expect(overlay).toHaveCount(0);
    await expect(button).toBeVisible();
    expectNoDiagnostics();
  });
});
