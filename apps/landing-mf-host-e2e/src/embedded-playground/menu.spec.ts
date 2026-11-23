import { expect, test } from '@playwright/test';

import { observeLandingDiagnostics } from '../landing-journey';
import { onePasswordExample, openEmbeddedPlayground } from './journey';

test('02.06 — embedded navigation selects examples and returns to the shared theme',
  async ({ page }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);
    const overlay = await openEmbeddedPlayground(page);

    await expect(overlay.getByRole('button', { name: 'Back to landing' }))
      .toHaveCount(0);
    await expect(overlay.getByRole('navigation', { name: 'Example specifications' }))
      .toHaveCount(0);
    await overlay.getByRole('button', { name: 'Appearance preferences' }).click();
    await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();
    await overlay.getByRole('button', { name: 'Open navigation menu' }).click();

    const navigation = page.getByRole('navigation', { name: 'Navigation drawer' });
    const examples = page.getByRole('group', { name: 'Examples', exact: true });
    const closeMenu = page.getByRole('button', { name: 'Close navigation menu' });
    const navigationId = await navigation.getAttribute('id');

    await expect(closeMenu).toHaveAttribute('aria-controls', navigationId ?? '');
    await expect(page.getByRole('region', { name: 'Navigation overlay' })
      .getByRole('img', { name: 'Codegena wordmark' })).toBeVisible();
    await expect(page.locator(`[id="${navigationId}"]`)).toHaveCount(1);

    await expect(navigation.getByRole('link')).toHaveText([
      'Return to landing', 'Docs', 'Roadmap and status', 'Blog', 'GitHub', 'Get started',
    ]);
    await expect(page.getByRole('heading', { name: 'Theme', exact: true }))
      .toHaveCount(0);
    await expect(examples).toBeVisible();
    await expect(examples.getByRole('button', { name: onePasswordExample }))
      .toBeDisabled();
    await expect(examples.getByRole('button', { name: onePasswordExample }))
      .toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: 'koshevy@gmail.com', exact: true }))
      .toBeVisible();
    await examples.getByRole('button', { name: 'Simplest pet store' }).click();

    const petstore = page.getByRole('dialog', { name: 'Simplest pet store demo' });

    await expect(petstore.getByRole('button', { name: 'Appearance preferences' }))
      .toBeVisible({ timeout: 90_000 });
    await petstore.getByRole('button', { name: 'Appearance preferences' }).click();
    await expect(page.getByRole('menuitemradio', { name: 'Light', exact: true }))
      .toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await petstore.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.keyboard.press('Escape');
    await expect(petstore.getByRole('button', { name: 'Open navigation menu' }))
      .toBeFocused();
    await petstore.getByRole('button', { name: 'Open navigation menu' }).click();
    await navigation.getByRole('link', { name: 'Return to landing' }).click();
    await expect(petstore).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.getByRole('button', { name: 'Theme: Light' })).toBeVisible();
    expectNoDiagnostics();
  });

[{ mode: 'dark', label: 'Dark' }, { mode: 'light', label: 'Light' }].forEach(({
  label: themeLabel,
  mode,
}) => {
  test(`02.06 — ${mode} appearance stays consistent during conversion`, async ({
    context,
    page,
  }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);
    const download = Promise.withResolvers<void>();
    const resume = Promise.withResolvers<void>();

    await page.addInitScript((selectedMode) => {
      localStorage.setItem('codegena:landing:theme', selectedMode);
    }, mode);
    await context.route('**/services/specification-converter*.js', async (route) => {
      download.resolve();
      await resume.promise;
      await route.continue();
    }, { times: 1 });

    const opening = openEmbeddedPlayground(page, 'Simplest pet store');

    try {
      await download.promise;

      const placeholder = page.getByRole('status', {
        name: 'Specification is converting',
      });
      const themeColor = await page.locator('body').evaluate((body) => (
        getComputedStyle(body).color
      ));

      await expect(placeholder).toBeVisible();

      const secondaryColor = await page.getByRole('navigation', {
        includeHidden: true,
        name: 'Main navigation',
      }).getByRole('link', {
        includeHidden: true,
        name: 'Docs',
        exact: true,
      }).evaluate((link) => getComputedStyle(link).color);

      await expect(placeholder).toHaveCSS('color', secondaryColor);
      resume.resolve();

      const overlay = await opening;

      await expect(page.locator('body')).toHaveCSS('color', themeColor);
      await expect(overlay.getByRole('group', { name: 'Playground toolbar' }))
        .toHaveCSS('color', themeColor);
      await overlay.getByRole('button', { name: 'Appearance preferences' }).click();
      await expect(page.getByRole('menuitemradio', {
        name: themeLabel,
        exact: true,
      })).toHaveAttribute('aria-checked', 'true');
      expectNoDiagnostics();
    }
    finally {
      resume.resolve();
      await opening;
    }
  });
});
