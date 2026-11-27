import { expect, test } from '../../fixtures';
import { observeLandingDiagnostics } from '../landing-journey';
import { openEmbeddedPlayground, startEmbeddedPlayground } from './journey';

test('02.06 — example URLs support Back, Forward, and reload', async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const onePassword = await openEmbeddedPlayground(page);
  const sessionStart = await page.evaluate(() => performance.timeOrigin);

  await expect(page).toHaveURL(/one-password\.json\?testingMode=true$/);
  await onePassword.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('group', { name: 'Examples', exact: true })
    .getByRole('button', { name: 'Simplest pet store' }).click();

  const petstore = page.getByRole('dialog', { name: 'Simplest pet store demo' });

  await expect(petstore.getByRole('button', { name: 'Appearance preferences' }))
    .toBeVisible({ timeout: 90_000 });
  await expect(page).toHaveURL(/pet-store\.json\?testingMode=true$/);
  await page.goBack();
  await expect(onePassword.getByRole('heading', {
    name: 'Declaration Api1PasswordConnect',
    exact: true,
  })).toBeVisible({ timeout: 90_000 });
  await page.goForward();
  await expect(petstore.getByRole('button', { name: 'Appearance preferences' }))
    .toBeVisible({ timeout: 90_000 });
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(sessionStart);

  await page.reload();
  await expect(petstore.getByRole('button', { name: 'Appearance preferences' }))
    .toBeVisible({ timeout: 90_000 });
  expectNoDiagnostics();
});

test('02.06 — cancelling a pending host route aborts its conversion', async ({
  context,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const download = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();

  await context.route('**/services/specification-converter*.js', async (route) => {
    download.resolve();
    await resume.promise;
    await route.continue();
  }, { times: 1 });

  await startEmbeddedPlayground(page, 'Simplest pet store');

  try {
    await download.promise;
    await expect(page.getByRole('status', { name: 'Specification is converting' }))
      .toBeVisible();

    const cancellation = page.waitForResponse((response) => {
      const url = new URL(response.url());

      return url.pathname === '/api/specification'
        && response.request().method() === 'DELETE';
    });

    await page.getByRole('button', { name: 'Cancel conversion' }).click();
    await expect(page.getByRole('region', { name: 'Welcome' })).toBeVisible();
    await expect(page).toHaveURL(/\/\?testingMode=true$/);

    const cancelled = await cancellation;

    expect(cancelled.ok()).toBe(true);
    expectNoDiagnostics();
  }
  finally {
    resume.resolve();
  }
});
