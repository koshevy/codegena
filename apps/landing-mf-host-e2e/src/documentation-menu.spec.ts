import assert from 'node:assert/strict';

import { expect, test } from '../fixtures';
import { observeLandingDiagnostics } from './landing-journey';

test.use({ storageState: { cookies: [], origins: [] } });

const themes = [
  { colorScheme: 'dark', label: 'Dark' },
  { colorScheme: 'light', label: 'Light' },
] as const;

themes.forEach(({ colorScheme, label }) => {
  test(`DOCS-16 — narrow ${colorScheme} docs menu covers the page`, async ({
    page,
  }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);
    const viewport = page.viewportSize();

    assert(viewport, 'This journey requires a configured browser viewport.');

    const narrowViewport = { ...viewport, width: Math.min(viewport.width, 900) };

    await page.setViewportSize(narrowViewport);
    await page.emulateMedia({ colorScheme });
    await page.goto('/docs');

    const notice = page.getByRole('region', { name: 'Cookies and privacy' });
    const navigation = page.getByRole('navigation', { name: 'Main', exact: true });
    const toggle = navigation.getByRole('button', { name: 'Toggle navigation bar' });

    await expect(notice).toBeVisible();
    await navigation.getByRole('button', { name: /^Theme:/ }).click();
    await page.getByRole('menuitemradio', { name: label, exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(notice).toBeHidden();

    const coreFeatures = navigation.getByRole('link', {
      name: 'Core features',
      exact: true,
    });

    await expect(coreFeatures).toBeInViewport();

    // Docusaurus's fixed drawer and backdrop have no dedicated semantic roles.
    await expect(page.locator('.navbar-sidebar'))
      .toHaveCSS('height', `${narrowViewport.height}px`);
    await expect(page.locator('.navbar-sidebar__backdrop'))
      .toHaveCSS('height', `${narrowViewport.height}px`);
    await page.mouse.click(narrowViewport.width - 24, narrowViewport.height - 24);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(notice).toBeVisible();

    await toggle.click();
    await coreFeatures.click();
    await expect(page).toHaveURL('/docs/core-features');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await navigation.getByRole('button', { name: '← Back to main menu' }).click();
    await expect(navigation.getByRole('link', { name: 'Playground', exact: true }))
      .toBeInViewport();
    await navigation.getByRole('button', { name: 'Close navigation bar' }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expectNoDiagnostics();
  });
});
