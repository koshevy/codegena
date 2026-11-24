import { type CDPSession, expect, test, type Page } from '@playwright/test';

import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
  waitForPlaygroundIllustration,
} from './landing-journey';

async function swipeDown(session: CDPSession, x: number, y: number): Promise<void> {
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });

  for (const distance of [50, 100, 150, 200]) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y + distance }],
    });
  }

  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function scrollTowardTop(page: Page, isMobile: boolean): Promise<void> {
  const viewport = page.viewportSize();

  if (!viewport) {
    throw new Error('The landing page needs a viewport for the scroll gesture.');
  }

  const x = viewport.width - 8;
  const y = Math.round(viewport.height / 2);

  if (isMobile) {
    const session = await page.context().newCDPSession(page);

    try {
      await swipeDown(session, x, y);
    }
    finally {
      await session.detach();
    }

    return;
  }

  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -400);
}

test('02.04 — GitHub graph search finds a generated declaration', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });

  await scrollSecondScreenTo(page, 11.90909 / 17);
  await waitForPlaygroundIllustration(page);

  await expect(playground.getByText('04 / COMPREHENSIVE DATA ENGINE'))
    .toBeVisible();
  await expect(playground.getByRole('heading', {
    name: 'Graph index by our own design',
  })).toBeVisible();

  const demoButton = playground.getByRole('button', {
    name: 'Try searching GitHub’s API',
  });

  await expect(demoButton).toBeVisible();
  await expect(playground.getByRole('img', {
    name: 'Click to try out the search',
  })).toBeVisible();
  await expect(page).toHaveScreenshot('02-04-data-engine.png');
  await demoButton.click();

  const drawer = page.getByRole('dialog', {
    name: 'Search generated files and directories',
  });

  await expect(drawer).toBeVisible();

  const searchInputName = [
    'Search generated files, directories, declarations,',
    'specification, and warnings',
  ].join(' ');
  const searchInput = drawer.getByRole('combobox', {
    name: searchInputName,
  });

  await expect(searchInput).toBeFocused();
  await expect(searchInput).toHaveAttribute(
    'placeholder',
    'Try something like "PublicEvent"',
  );
  await expect(drawer.getByRole('option').first()).toBeVisible();
  await expect(searchInput).toBeFocused();

  const backgroundSearch = page.waitForResponse((response) => (
    response.url().endsWith('/api/graph-search')
    && response.fromServiceWorker()
  ));

  await searchInput.fill('CopilotSeatDetails');
  await expect(drawer.getByRole('option', {
    name: /CopilotSeatDetails/,
  }).first()).toBeVisible();

  const searchResponse = await backgroundSearch;

  expect(searchResponse.ok()).toBe(true);
  expectNoDiagnostics();
});

test('02.04 — opening search keeps the landing page still until it closes', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await scrollSecondScreenTo(page, 11.90909 / 17);

  await page.getByRole('button', {
    name: 'Try searching GitHub’s API',
  }).click();

  const drawer = page.getByRole('dialog', {
    name: 'Search generated files and directories',
  });

  await expect(drawer).toBeVisible();

  const scrollPosition = await page.evaluate(() => window.scrollY);

  await scrollTowardTop(page, isMobile);
  await expect.poll(async () => page.evaluate(() => window.scrollY))
    .toBe(scrollPosition);

  await drawer.getByRole('combobox').press('Escape');
  await expect(page.getByRole('dialog', { includeHidden: true })).toHaveCount(0);

  await scrollTowardTop(page, isMobile);
  await expect.poll(async () => page.evaluate(() => window.scrollY))
    .toBeLessThan(scrollPosition);

  expectNoDiagnostics();
});
