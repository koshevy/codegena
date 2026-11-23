import { expect, type Locator, test } from '@playwright/test';

import {
  freezeSvgAnimation,
  observeLandingDiagnostics,
  scrollLandingTo,
} from './landing-journey';

async function expectFooterBrandingGaps(
  footer: Locator,
  isNarrow: boolean,
): Promise<void> {
  const policies = footer.getByRole('navigation', { name: 'Policies' });
  const [brandBounds, securityBounds, privacyBounds] = await Promise.all([
    footer.getByRole('img', { name: 'Codegena wordmark' }).boundingBox(),
    policies.getByRole('link', { name: 'Security' }).boundingBox(),
    policies.getByRole('link', { name: 'Personal data privacy' }).boundingBox(),
  ]);

  if (!brandBounds || !securityBounds || !privacyBounds) {
    throw new Error('The footer wordmark and policy links must be visible.');
  }

  const brandGap = isNarrow
    ? securityBounds.y - brandBounds.y - brandBounds.height
    : securityBounds.x - brandBounds.x - brandBounds.width;

  const policyGap = privacyBounds.x - securityBounds.x - securityBounds.width;

  expect(brandGap).toBeCloseTo(policyGap, 0);
}

test('03.00 — the playground peels away as ideology contours shrink', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });
  const ideology = page.getByRole('region', {
    name: 'Complexity management',
  });
  const stage = playground.locator(':scope > div');
  const pattern = ideology.getByTestId('ideology-contours');
  const boundary = await playground.evaluate((element) => (
    window.scrollY + element.getBoundingClientRect().bottom - window.innerHeight
  ));
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  await scrollLandingTo(page, Math.floor(boundary + viewportHeight * 0.15));

  const initialStageWidth = await stage.evaluate((element) => (
    element.getBoundingClientRect().width
  ));
  const initialPatternWidth = await pattern.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  await scrollLandingTo(page, Math.floor(boundary + viewportHeight * 0.4));

  const peeledStageWidth = await stage.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  expect(peeledStageWidth).toBeLessThan(initialStageWidth);
  await expect(ideology).toBeInViewport();

  const stageCorners = await stage.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      bottom: Number(styles.borderBottomLeftRadius.replace('px', '')),
      top: Number(styles.borderTopLeftRadius.replace('px', '')),
    };
  });

  expect(stageCorners.top).toBe(0);
  expect(stageCorners.bottom).toBeGreaterThan(0);

  await scrollLandingTo(page, Math.floor(boundary + viewportHeight * 0.9));

  const narrowStageWidth = await stage.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  await scrollLandingTo(page, Math.floor(boundary + viewportHeight * 0.8));

  const reversedStageWidth = await stage.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  expect(reversedStageWidth).toBeGreaterThan(narrowStageWidth);
  await scrollLandingTo(page, Math.floor(boundary + viewportHeight * 0.7));

  const visiblePatternWidth = await pattern.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  await scrollLandingTo(page, Math.floor(boundary + viewportHeight * 1.2));

  const smallerPatternWidth = await pattern.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  expect(visiblePatternWidth).toBeLessThan(initialPatternWidth);
  expect(smallerPatternWidth).toBeLessThan(visiblePatternWidth);
  await expect(ideology.getByText('07 / THE IDEOLOGY')).toBeVisible();

  await scrollLandingTo(page, Math.floor(boundary + viewportHeight * 0.7));

  const reversedPatternWidth = await pattern.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  expect(reversedPatternWidth).toBeGreaterThan(smallerPatternWidth);

  await scrollLandingTo(page, Math.floor(boundary - viewportHeight * 0.3));
  await expect(playground.getByText('06 / UNIFIED UI')).toBeVisible();

  const fullStageWidth = await stage.evaluate((element) => (
    element.getBoundingClientRect().width
  ));
  const viewportWidth = await page.evaluate(() => window.innerWidth);

  expect(fullStageWidth).toBeGreaterThan(viewportWidth * 0.99);

  await scrollLandingTo(page, Math.floor(boundary - viewportHeight * 1.2));
  await expect(playground.getByText('06 / UNIFIED UI')).toBeVisible();

  await scrollLandingTo(page, Math.floor(boundary - viewportHeight * 1.9));
  await expect(playground.getByText('05 / IDE PLUGINS')).toBeVisible();

  expectNoDiagnostics();
});

test('03.01 — the ideology explains five ways to manage complexity', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const ideology = page.getByRole('region', {
    name: 'Complexity management',
  });

  await ideology.scrollIntoViewIfNeeded();
  await expect(ideology.getByText('07 / THE IDEOLOGY')).toBeVisible();
  await expect(ideology).toContainText('the most efficient way to save human effort');

  const items = ideology.getByRole('listitem');

  await expect(items).toHaveCount(5);

  const principles = [
    ['Spec first', 'OpenAPI and business-level specifications'],
    ['Generate', 'consistent logic across codebases'],
    ['Extend', 'EJS templates or AST-based generators'],
    ['Explore', 'search, graph views, and a virtual file system'],
    ['Collaborate (soon)', 'one auditable process'],
  ] as const;

  for (const [index, [title, description]] of principles.entries()) {
    const item = items.nth(index);

    await item.scrollIntoViewIfNeeded();
    await expect(item).toBeInViewport();
    await expect(item.getByRole('heading', { name: title })).toBeVisible();
    await expect(item).toContainText(description);
  }

  expectNoDiagnostics();
});

test('03.02 — the footer repeats navigation and contact information', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });

  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeInViewport();

  const wordmark = footer.getByRole('img', { name: 'Codegena wordmark' });

  await expect(wordmark).toBeVisible();

  const navigation = footer.getByRole('navigation', {
    name: 'Footer navigation',
  });

  for (const name of [
    'Docs',
    'Roadmap and status',
    'Playground',
    'Ideology',
    'Blog',
    'About',
    'GitHub',
    'Contacts',
    'Get started',
  ]) {
    await expect(navigation.getByRole('link', { name })).toBeVisible();
  }

  const policies = footer.getByRole('navigation', { name: 'Policies' });

  await expect(policies.getByRole('link', { name: 'Security' })).toBeVisible();
  await expect(policies.getByRole('link', { name: 'Personal data privacy' }))
    .toBeVisible();

  await page.evaluate(() => document.fonts.ready);
  await expectFooterBrandingGaps(footer, isMobile);

  const socialLinks = footer.getByRole('navigation', { name: 'Social links' });

  for (const name of ['X', 'GitHub', 'LinkedIn']) {
    await expect(socialLinks.getByRole('link', { name })).toBeVisible();
  }

  await expect(footer.getByText('Alexander Koshevoy · 2018–2026'))
    .toBeVisible();
  await expect(footer.getByRole('link', { name: 'koshevy@gmail.com' }))
    .toHaveAttribute('href', 'mailto:koshevy@gmail.com');
  await freezeSvgAnimation(wordmark);
  await expect(footer).toHaveScreenshot('03-02-site-footer.png');

  expectNoDiagnostics();
});
