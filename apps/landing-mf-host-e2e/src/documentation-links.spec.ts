import type { Page } from '@playwright/test';

import { expect, test } from '../fixtures';
import { openDocumentationNavigation } from './documentation-journey';
import { observeLandingDiagnostics, scrollLandingTo } from './landing-journey';

async function openContents(
  page: Page,
  isMobile: boolean,
): Promise<void> {
  if (isMobile) {
    await page.getByRole('button', { name: 'On this page' }).click();
  }
}

test('DOCS-12 — contents links stay on the article and reveal its section', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/docs');
  await expect(page.getByRole('heading', { name: 'Get started', exact: true }))
    .toBeVisible();

  await openContents(page, isMobile);

  const contentsLink = page.getByRole('link', {
    name: 'Generate TypeScript',
    exact: true,
  });
  const bodyFontSize = await page.getByRole('article').getByRole('paragraph')
    .first().evaluate((element) => getComputedStyle(element).fontSize);

  await expect(contentsLink).toHaveCSS('font-size', bodyFontSize);
  await contentsLink.click();
  await expect(page).toHaveURL(/\/docs#generate-typescript$/);
  await expect(page.getByRole('heading', { name: /^Generate TypeScript/ }))
    .toBeInViewport();
  await page.goBack();
  await expect(page).toHaveURL('/docs');
  await page.goForward();
  await expect(page).toHaveURL(/\/docs#generate-typescript$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: /^Generate TypeScript/ }))
    .toBeInViewport();
  expectNoDiagnostics();
});

test('DOCS-15 — docs navigation orders pages and preserves reading styles @desktop-menu',
  async ({ page }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);

    await page.goto('/docs');

    const navigation = page.getByRole('navigation', { name: 'Main', exact: true });

    await expect(navigation.getByRole('link').filter({
      hasText: /^(Docs|Roadmap and status|Blog|Playground|About|Contacts)$/,
    })).toHaveText([
      'Docs',
      'Roadmap and status',
      'Blog',
      'About',
      'Contacts',
      'Playground',
    ]);

    const sidebar = page.getByRole('navigation', { name: 'Docs sidebar' });

    await expect(sidebar).toHaveCSS('padding-right', '16px');
    await expect(sidebar.getByRole('link').first()).toHaveText('Roadmap and status');

    const nextPage = page.getByRole('navigation', { name: 'Docs pages' })
      .getByRole('link', { name: /Next Core features/ });
    // Docusaurus separates the page title from its Previous/Next caption.
    const title = nextPage.locator('.pagination-nav__label');
    const bodyColor = await page.getByRole('article').getByRole('paragraph')
      .first().evaluate((element) => getComputedStyle(element).color);

    await expect(title).toHaveCSS('font-weight', '400');
    await expect(title).toHaveCSS('color', bodyColor);
    expectNoDiagnostics();
  });

const documentationPages = [
  { name: 'Roadmap and status', path: '/docs/roadmap-and-status' },
  { name: 'About', path: '/docs/about' },
  { name: 'Contacts', path: '/docs/contacts' },
] as const;

documentationPages.forEach(({ name, path }) => {
  test(`DOCS-13 — ${name} opens from landing navigation and docs`, async ({
    isMobile,
    page,
  }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);

    await page.goto('/?testingMode=true');
    await scrollLandingTo(page, 800);
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.getByRole('navigation', { name: 'Navigation drawer' })
      .getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { name, level: 1, exact: true }))
      .toBeVisible();

    const footer = page.getByRole('contentinfo', { name: 'Site footer' });

    await footer.getByRole('link', { name: 'Codegena home' }).click();
    await expect(page).toHaveURL('/');
    await footer.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(path);
    await page.reload();
    await expect(page.getByRole('heading', { name, level: 1, exact: true }))
      .toBeVisible();
    await openDocumentationNavigation(page, isMobile);

    const navigation = page.getByRole('navigation', { name: 'Main', exact: true });

    await expect(navigation.getByRole('link', { name, exact: true }).first())
      .toHaveAttribute('aria-current', 'page');
    await expect(navigation.getByRole('link', { name: 'Docs', exact: true }).first())
      .not.toHaveAttribute('aria-current', 'page');
    expectNoDiagnostics();
  });
});

test('DOCS-14 — documentation policies open from the landing overlay', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, 800);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('region', { name: 'Navigation overlay' })
    .getByRole('link', { name: 'Personal data privacy', exact: true }).click();
  await expect(page).toHaveURL('/docs/personal-data-privacy');
  await expect(page.getByRole('heading', { name: 'Personal data privacy', level: 1 }))
    .toBeVisible();
  expectNoDiagnostics();
});
