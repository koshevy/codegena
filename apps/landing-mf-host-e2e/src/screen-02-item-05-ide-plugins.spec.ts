import type { Locator } from '@playwright/test';

import { expect, test } from '../fixtures';
import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
  waitForPlaygroundIllustration,
} from './landing-journey';

async function getRingCenter(ring: Locator): Promise<{ x: number; y: number }> {
  return ring.evaluate((element) => {
    const bounds = element.getBoundingClientRect();

    return {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    };
  });
}

test('02.05 — IDE plugins preview shows the planned editors', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await scrollSecondScreenTo(page, 14 / 17);
  await expect(page.getByRole('group', { name: 'Feature illustration' }))
    .toHaveCSS('transform', 'none');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });
  const illustration = playground.getByRole('group', {
    name: 'IDE plugin preview',
  });

  await expect(playground.getByText('05 / IDE PLUGINS')).toBeVisible();
  await expect(playground.getByRole('heading', {
    name: 'Work in your IDE In development!',
  })).toBeVisible();
  await expect(playground.getByText('In development!')).toBeVisible();

  // The sticky stage is the theme's paper surface behind the feature content.
  const paperColor = await playground.locator(':scope > div').evaluate((element) => (
    getComputedStyle(element).backgroundColor
  ));

  await expect(playground.getByText('In development!')).toHaveCSS('color', paperColor);
  await expect(playground.getByText(/editing, exploration, and collaboration/))
    .toBeVisible();
  await expect(illustration.getByRole('img', { name: 'Soon!' })).toBeVisible();
  await expect(illustration.getByRole('img', {
    name: 'Visual Studio Code',
  })).toBeVisible();
  await expect(illustration.getByRole('img', {
    name: 'JetBrains IDEs',
  })).toBeVisible();
  await expect(illustration.getByRole('img', { name: 'Cursor' })).toBeVisible();
  await expect(page).toHaveScreenshot('02-05-ide-plugins.png');
  expectNoDiagnostics();
});

test('02.05 — IDE and search rings share the same center', async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });

  await scrollSecondScreenTo(page, 11.90909 / 17);
  await waitForPlaygroundIllustration(page);

  const searchRing = playground.getByRole('img', {
    name: 'Click to try out the search',
  });
  const searchCenter = await getRingCenter(searchRing);

  await scrollSecondScreenTo(page, 14 / 17);

  const ideRing = playground.getByRole('img', { name: 'Soon!' });
  const ideCenter = await getRingCenter(ideRing);

  expect(Math.abs(ideCenter.x - searchCenter.x)).toBeLessThan(4);
  expect(Math.abs(ideCenter.y - searchCenter.y)).toBeLessThan(4);
  expectNoDiagnostics();
});
