import { testWithBrowserDiagnostics as test } from '@codegena/util-e2e';
import { expect, type Response } from '@playwright/test';

test('loads a local specification and searches through the virtual API', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '1Password', exact: true }).click();
  await page.getByRole('button', { name: 'Search in files and directories' }).click();

  const search = page.getByRole('combobox');

  await expect(search).toBeFocused();
  await expect(page.getByRole('option').first()).toBeVisible();

  const result = page.waitForResponse((candidate) => {
    const request = candidate.request();
    const input: unknown = request.postDataJSON();

    return candidate.url().endsWith('/api/graph-search')
      && request.method() === 'POST'
      && typeof input === 'object'
      && input !== null
      && 'query' in input
      && input.query === 'ApiRequest';
  });

  await search.fill('ApiRequest');

  const response = await result;

  expect(response.fromServiceWorker()).toBe(true);
  await expect(page.getByRole('option', { name: /^ApiRequest\b/ })).toBeVisible();
  await search.press('Escape');

  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  expect(documentHeight).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);
});

test('cancels an unfinished conversion when another specification is selected', async ({
  context,
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('button', {
    name: 'Search in files and directories',
  })).toBeVisible();

  const download = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();

  await context.route('**/services/specification-converter*.js', async (route) => {
    download.resolve();
    await resume.promise;
    await route.continue();
  }, { times: 1 });

  try {
    const started = page.waitForResponse((response) => (
      response.url().endsWith('/api/specification')
      && response.request().method() === 'POST'
    ));

    await page.getByRole('link', { name: '1Password', exact: true }).click();

    const startResponse = await started;
    const jobUrl = getSpecificationJobUrl(startResponse);

    expect(startResponse.fromServiceWorker()).toBe(true);

    const pending = page.waitForResponse((response) => (
      response.url() === jobUrl
      && response.request().method() === 'GET'
      && response.status() === 202
    ));

    await download.promise;
    await pending;
    await expect(page.getByRole('status', {
      name: 'Specification is converting',
    })).toBeVisible();

    const cancelled = page.waitForResponse((response) => (
      response.url() === jobUrl
      && response.request().method() === 'DELETE'
    ));

    await page.getByRole('link', { name: 'Account schema', exact: true }).click();

    const cancelResponse = await cancelled;

    expect(cancelResponse.status()).toBe(204);

    await expect(page.getByRole('status', {
      name: 'Specification is converting',
    })).toBeHidden();
    await expect(page.getByRole('button', {
      name: 'Search in files and directories',
    })).toBeVisible();
    await expect(page.getByRole('link', {
      name: 'Account schema',
      exact: true,
    })).toHaveAttribute('aria-current', 'page');
  }
  finally {
    resume.resolve();
  }
});

test('rejects a foreign specification URL', async ({ page }) => {
  const specUrl = encodeURIComponent('https://foreign.test/schema.json');

  await page.goto(`/playground/${specUrl}`);
  await expect(page.getByRole('alert')).toContainText('same-origin');
});

function getSpecificationJobUrl(response: Response): string {
  const input: unknown = response.request().postDataJSON();

  const id = typeof input === 'object'
    && input !== null
    && 'id' in input
    ? input.id
    : undefined;

  if (typeof id !== 'string') {
    throw new TypeError('The conversion request must include its job ID.');
  }

  const jobUrl = new URL(response.url());

  jobUrl.searchParams.set('id', id);

  return jobUrl.href;
}
