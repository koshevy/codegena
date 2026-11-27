import { expect, test } from '../fixtures';
import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
  waitForPlaygroundIllustration,
  waitForWelcomeEntrance,
} from './landing-journey';

test('02.00 — the progress blob travels down and restarts for each feature', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });
  const progress = playground.getByRole('progressbar', {
    name: 'Current feature scroll progress',
  });

  await scrollSecondScreenTo(page, 2 / 17);
  await expect(playground.getByText('01 / JSON SCHEMA')).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', '50');

  await scrollSecondScreenTo(page, (4 + 4 * 0.25) / 17);
  await expect(playground.getByText('02 / CLI')).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', '25');

  const earlyPosition = await progress.evaluate((element) => (
    element.getBoundingClientRect().top
  ));

  await scrollSecondScreenTo(page, (4 + 4 * 0.65) / 17);
  await expect(progress).toHaveAttribute('aria-valuenow', '65');

  const laterPosition = await progress.evaluate((element) => (
    element.getBoundingClientRect().top
  ));

  expect(laterPosition).toBeGreaterThan(earlyPosition);

  await scrollSecondScreenTo(page, (8 + 3 * 0.05) / 17);
  await expect(playground.getByText('03 / FOLDERING')).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', '5');

  const resetPosition = await progress.evaluate((element) => (
    element.getBoundingClientRect().top
  ));

  expect(resetPosition).toBeLessThan(earlyPosition);

  await scrollSecondScreenTo(page, (11 + 2 * 0.05) / 17);
  await expect(playground.getByText('04 / COMPREHENSIVE DATA ENGINE')).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', '5');

  await scrollSecondScreenTo(page, (13 + 2 * 0.05) / 17);
  await expect(playground.getByText('05 / IDE PLUGINS')).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', '5');
  expectNoDiagnostics();
});

test('02.00 — the blob fills the screen at the start of section 06', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const progress = page.getByRole('progressbar', {
    name: 'Current feature scroll progress',
  });

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });
  const storyTravel = await playground.evaluate((element) => (
    element.getBoundingClientRect().height - window.innerHeight
  ));

  await scrollSecondScreenTo(page, 15 / 17 - 120 / storyTravel);

  const initialWidth = await progress.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  await scrollSecondScreenTo(page, 15 / 17 - 80 / storyTravel);

  const lateFifthSectionWidth = await progress.evaluate((element) => (
    element.getBoundingClientRect().width
  ));
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  expect(lateFifthSectionWidth).toBeGreaterThan(initialWidth);

  await scrollSecondScreenTo(page, 15 / 17 - 2 / storyTravel);

  const fifthSectionBounds = await progress.evaluate((element) => (
    element.getBoundingClientRect().toJSON()
  ));

  expect(fifthSectionBounds.width).toBeLessThan(viewportWidth);
  expect(fifthSectionBounds.top).toBeGreaterThan(0);

  const growthTravel = 0.18 * viewportHeight;
  const completedGrowthOffset = growthTravel - Math.min(100, growthTravel * 0.9);

  await scrollSecondScreenTo(page, 15 / 17 + (
    completedGrowthOffset + 2
  ) / storyTravel);
  await expect(page.getByText('06 / UNIFIED UI')).toBeVisible();
  await expect(page.getByRole('heading', {
    name: 'Try the playground right here',
  })).toBeVisible();
  await expect(page.getByText(/run entirely in the browser, without Node.js or a server/))
    .toBeVisible();
  await expect(page.getByText(
    /served locally from a terminal, embedded in an IDE, or used online/,
  )).toBeVisible();
  await expect(playground.getByRole('heading', {
    level: 3,
    name: 'Select example:',
  })).toBeVisible();
  await expect(playground.getByRole('heading', {
    name: 'Try the playground right here',
  })).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.getByText('right here', { exact: true }))
    .toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(playground.getByRole('heading', { name: 'Select example:' }))
    .toHaveCSS('color', 'rgb(255, 255, 255)');

  await expect(page.getByRole('group', {
    name: 'Feature illustration',
  }).getByRole('button', {
    name: 'Simplest pet store',
  })).toBeVisible();
  await expect(playground.getByRole('status', {
    includeHidden: true,
    name: 'Landing section 7 of 8',
  })).toBeVisible({ visible: !isMobile });
  await expect(playground.getByRole('link', {
    name: 'Reveal in documentation',
  })).toHaveCount(0);

  const sectionProgress = playground.getByRole('group', {
    includeHidden: true,
    name: 'Feature section scroll progress',
  });

  await expect(sectionProgress).toHaveCSS('mix-blend-mode', 'normal');
  await expect(sectionProgress).toHaveCSS('text-shadow', 'none');
  await expect(playground.getByRole('status', {
    includeHidden: true,
    name: 'Landing section 7 of 8',
  })).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(playground.getByRole('button', {
    name: 'Simplest pet store',
  })).toHaveCSS('font-weight', '400');

  const filledBounds = await progress.evaluate((element) => (
    element.getBoundingClientRect().toJSON()
  ));

  expect(filledBounds.width).toBeGreaterThan(viewportWidth);
  expect(filledBounds.left).toBeLessThan(0);
  expect(filledBounds.right).toBeGreaterThan(viewportWidth);
  expect(filledBounds.top).toBeLessThan(0);
  expect(filledBounds.bottom).toBeGreaterThan(viewportHeight);
  await expect(page).toHaveScreenshot('02-06-blob-fill.png');

  await scrollSecondScreenTo(page, 15.75 / 17);

  const restingBounds = await progress.evaluate((element) => (
    element.getBoundingClientRect().toJSON()
  ));

  expect(restingBounds.width).toBeCloseTo(filledBounds.width, 0);
  expect(restingBounds.top).toBeCloseTo(filledBounds.top, 0);

  await scrollSecondScreenTo(page, 14.5 / 17);
  await expect(page.getByText('05 / IDE PLUGINS')).toBeVisible();
  await expect(playground.getByRole('link', {
    name: 'Reveal in documentation',
  })).toBeVisible();
  await expect(sectionProgress).toHaveCSS('mix-blend-mode', 'normal');
  expectNoDiagnostics();
});

for (const label of [
  'Simplest pet store',
  '1Password small API set (67 declarations)',
  'Edge case for GitHub (5000+ declarations)',
]) {
  test(`02.06 — ${label} dollies into a full-screen overlay`, async ({
    context,
    page,
  }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);

    await page.goto('/?testingMode=true');
    await waitForWelcomeEntrance(page);
    await page.getByRole('button', { name: 'Playground', exact: true }).click();

    const illustration = page.getByRole('group', {
      includeHidden: true,
      name: 'Feature illustration',
    });
    const exampleHeading = page.getByRole('heading', {
      name: 'Select example:',
      exact: true,
    });

    await expect(exampleHeading).toBeInViewport();
    await scrollSecondScreenTo(page, 16 / 17);
    await waitForPlaygroundIllustration(page);
    await expect(exampleHeading).toHaveCSS('opacity', '1');

    const button = illustration.getByRole('button', {
      exact: true,
      includeHidden: true,
      name: label,
    });
    const resume = Promise.withResolvers<void>();
    const getButtonScale = async (): Promise<number> => button.evaluate((element) => (
      element.getBoundingClientRect().width / (element as HTMLElement).offsetWidth
    ));

    // Hold the actual download so the completed dolly remains observable.
    await context.route('**/specifications/*.json', async (route) => {
      await resume.promise;
      await route.continue();
    }, { times: 1 });

    const overlay = page.getByRole('dialog', { name: `${label} demo` });

    try {
      await button.click();
      await expect(overlay).toBeVisible();

      const destinationColor = await overlay.evaluate((element) => (
        getComputedStyle(element).backgroundColor
      ));

      await expect(button).toHaveCSS('background-color', destinationColor);
      await expect.poll(getButtonScale).toBeGreaterThan(1.1);
      await expect.poll(async () => overlay.evaluate((element) => (
        element.getBoundingClientRect().width
      ))).toBeGreaterThanOrEqual(await page.evaluate(() => window.innerWidth));
    }
    finally {
      resume.resolve();
    }

    await overlay.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.getByRole('link', { name: 'Return to landing', exact: true }).click();
    await expect(overlay).toHaveCount(0);
    await expect(page.getByText('06 / UNIFIED UI')).toBeVisible();
    await expect.poll(getButtonScale).toBeLessThan(1.1);
    expectNoDiagnostics();
  });
}

test('02.06 — a full-width glitch line follows the Unified UI scroll path', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const glitchLine = page.getByTestId('unified-ui-glitch-line');
  const features = page.getByRole('region', { name: 'Landing feature sections' });
  const storyTravel = await features.evaluate((element) => (
    element.getBoundingClientRect().height - window.innerHeight
  ));
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  await scrollSecondScreenTo(page, 14.5 / 17);
  await expect(glitchLine).toHaveCount(0);

  await scrollSecondScreenTo(page, 15 / 17 + 10 / storyTravel);
  await expect(page.getByText('06 / UNIFIED UI')).toBeVisible();
  await expect.poll(async () => glitchLine.evaluate((element) => (
    Number(getComputedStyle(element).opacity)
  ))).toBe(0);

  await scrollSecondScreenTo(page, 15 / 17 + 80 / storyTravel);
  await expect(glitchLine).toBeVisible();

  const faintOpacity = await glitchLine.evaluate((element) => (
    Number(getComputedStyle(element).opacity)
  ));
  const faintTop = await glitchLine.evaluate((element) => (
    element.getBoundingClientRect().top
  ));

  expect(faintOpacity).toBeGreaterThan(0);
  expect(faintOpacity).toBeLessThan(1);
  expect(faintTop).toBeLessThan(60);

  await scrollSecondScreenTo(page, 15.5 / 17);

  const blobBounds = await page.getByRole('progressbar', {
    name: 'Current feature scroll progress',
  }).evaluate((element) => element.getBoundingClientRect().toJSON());
  const viewportWidth = await page.evaluate(() => window.innerWidth);

  expect(blobBounds.top).toBeLessThan(0);
  expect(blobBounds.bottom).toBeGreaterThan(viewportHeight);
  expect(blobBounds.left).toBeLessThan(0);
  expect(blobBounds.right).toBeGreaterThan(viewportWidth);

  const initialBounds = await glitchLine.evaluate((element) => (
    element.getBoundingClientRect().toJSON()
  ));
  const expectedHeight = await page.evaluate(() => (
    Number(getComputedStyle(document.documentElement).fontSize.slice(0, -2)) * 6
  ));

  expect(initialBounds.width).toBeGreaterThan(viewportWidth * 0.95);
  expect(initialBounds.height).toBeCloseTo(expectedHeight, 0);

  await scrollSecondScreenTo(page, 16 / 17);

  const middleBounds = await glitchLine.evaluate((element) => (
    element.getBoundingClientRect().toJSON()
  ));

  await scrollSecondScreenTo(page, 16.9 / 17);

  const finalBounds = await glitchLine.evaluate((element) => (
    element.getBoundingClientRect().toJSON()
  ));

  expect(middleBounds.y).toBeGreaterThan(initialBounds.y);
  expect(finalBounds.y).toBeGreaterThan(middleBounds.y);

  await scrollSecondScreenTo(page, 15.5 / 17);

  await expect.poll(async () => glitchLine.evaluate((element) => (
    element.getBoundingClientRect().top
  ))).toBeCloseTo(initialBounds.y, 0);
  expectNoDiagnostics();
});

test('02.06 — the glitch keeps its dark-theme colors in light appearance', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await scrollSecondScreenTo(page, 15.5 / 17);

  const glitch = page.getByTestId('unified-ui-glitch-line');
  const gradient = await glitch.evaluate((element) => (
    getComputedStyle(element).backgroundImage
  ));

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Theme: Dark' }).click();
  await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();
  await scrollSecondScreenTo(page, 15.5 / 17);

  await expect(glitch).toHaveCSS('background-image', gradient);
  expectNoDiagnostics();
});
