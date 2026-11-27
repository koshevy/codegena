import type { Page } from '@playwright/test';

import { expect, test } from '../fixtures';
import {
  freezeSvgAnimation,
  observeLandingDiagnostics,
  scrollLandingTo,
} from './landing-journey';

function getGradientAngle(element: Element): number {
  if (!(element instanceof SVGLinearGradientElement)) {
    throw new TypeError('The logo gradient must be an SVG linear gradient.');
  }

  const transforms = element.gradientTransform.animVal;

  return transforms.numberOfItems ? transforms.getItem(0).angle : 0;
}

function getWheelOffset(element: Element): number {
  const transform = new DOMMatrixReadOnly(getComputedStyle(element).transform);

  return transform.m42;
}

test('01.15 — the expanded menu stays readable on a small desktop viewport', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.setViewportSize({ width: 960, height: 800 });
  await page.goto('/?testingMode=true');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
  await page.getByRole('button', { name: 'Open navigation menu' }).click();

  const links = page.getByRole('navigation', { name: 'Navigation drawer' })
    .getByRole('link');

  await expect(links.last()).toHaveText('Playground');
  await expect(links.filter({ hasText: 'Roadmap and status' })).toBeVisible();
  expectNoDiagnostics();
});

async function expectCenteredLogo(page: Page): Promise<void> {
  const headerBounds = await page.getByRole('banner', {
    name: 'Landing navigation',
  }).boundingBox();
  const titleBounds = await page.getByRole('heading', { level: 1 }).boundingBox();
  const logoBounds = await page.getByRole('img', {
    name: 'Codegena logo',
    exact: true,
  }).boundingBox();

  if (!headerBounds || !titleBounds || !logoBounds) {
    throw new Error('The header, logo, and hero title must have visible bounds.');
  }

  const freeSpaceCenter = (headerBounds.y + headerBounds.height + titleBounds.y) / 2;
  const logoCenter = logoBounds.y + logoBounds.height / 2;

  expect(Math.abs(logoCenter - freeSpaceCenter)).toBeLessThanOrEqual(1);
}

test('01.12 — the welcome scroll hint responds to width and motion preferences', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, 120);

  const heroLabel = page.getByRole('region', { name: 'Welcome' })
    .getByText('SCROLL TO DISCOVER');
  const featureLabels = page.getByRole('group', {
    includeHidden: true,
    name: 'Feature section scroll progress',
  });
  const footerCount = page.getByRole('status', {
    includeHidden: true,
    name: 'Landing section 8 of 8',
  });
  // The decorative document scrollbar has no accessible interaction role.
  const scrollbar = page.locator('.os-scrollbar-vertical.os-theme-codegena-window');
  const height = await page.evaluate(() => window.innerHeight);

  await expect(featureLabels.getByText('SCROLL TO DISCOVER')).toHaveCount(0);

  const widths = [
    [700, false, 'none'],
    [701, true, 'block'],
  ] as const;

  for (const [width, visible, display] of widths) {
    await page.setViewportSize({ height, width });
    await expect(heroLabel).toBeVisible({ visible });
    await expect(featureLabels).toBeVisible({ visible });
    await expect(footerCount).toBeVisible({ visible });
    await expect(scrollbar).toHaveCSS('display', display);
  }

  const hint = page.getByRole('group', { name: 'Scroll to discover', exact: true });
  const featureProgress = featureLabels.getByRole('status');

  await expect(featureProgress).toHaveCSS('gap', '16px');
  // The feature count and hero hint reuse the same decorative mouse and wheel.
  await expect(featureProgress.locator('svg')).toBeVisible();
  await expect(footerCount.locator('svg')).toBeVisible();

  // The moving wheel is a decorative path within Lucide's mouse illustration.
  const wheel = hint.locator('svg path');
  const initialOffset = await wheel.evaluate(getWheelOffset);

  await expect.poll(() => wheel.evaluate(getWheelOffset)).not.toBe(initialOffset);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => wheel.evaluate(getWheelOffset)).toBe(0);

  await scrollLandingTo(page, 240);
  expectNoDiagnostics();
});

test('01.13 — logo colors flow without moving the artwork and respect reduced motion',
  async ({ page }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);

    await page.goto('/?testingMode=true');

    const logo = page.getByRole('img', { name: 'Codegena logo', exact: true });

    await expect(logo).toBeVisible();
    await expect(logo.locator('..')).toHaveCSS('transform', 'none');

    await expectCenteredLogo(page);

    // Gradient motion is decorative SVG state with no separate accessible role.
    const gradient = logo.locator('linearGradient[id$="-base"]');
    // The first transformed SVG group contains the decorative loop alone.
    const loop = logo.locator('g[transform]').first();
    const initialAngle = await gradient.evaluate(getGradientAngle);
    const initialBounds = await logo.boundingBox();

    await expect.poll(() => gradient.evaluate(getGradientAngle))
      .not.toBe(initialAngle);

    await freezeSvgAnimation(logo);

    const firstFrame = await loop.screenshot();

    await freezeSvgAnimation(logo, 3);

    const laterFrame = await loop.screenshot();

    expect(laterFrame).not.toEqual(firstFrame);
    await expect.poll(() => logo.boundingBox()).toEqual(initialBounds);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await expect.poll(() => gradient.evaluate(getGradientAngle)).toBe(0);
    await logo.evaluate((element) => {
      if (!(element instanceof SVGSVGElement)) {
        throw new TypeError('The logo must be an SVG image.');
      }

      element.setCurrentTime(6);
    });
    expect(await gradient.evaluate(getGradientAngle)).toBe(0);
    expectNoDiagnostics();
  });

test('01.14 — shared wordmark colors flow and honor reduced motion', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });
  const wordmark = footer.getByRole('img', { name: 'Codegena wordmark' });

  await wordmark.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await freezeSvgAnimation(wordmark);

  const firstFrame = await wordmark.screenshot();

  await freezeSvgAnimation(wordmark, 3);

  const laterFrame = await wordmark.screenshot();

  expect(laterFrame).not.toEqual(firstFrame);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await freezeSvgAnimation(wordmark);

  const reducedFrame = await wordmark.screenshot();

  await freezeSvgAnimation(wordmark, 6);
  expect(await wordmark.screenshot()).toEqual(reducedFrame);
  expectNoDiagnostics();
});
