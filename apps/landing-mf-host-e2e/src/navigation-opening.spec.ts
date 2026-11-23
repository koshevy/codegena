import { expect, type Locator, test } from '@playwright/test';

import { openEmbeddedPlayground } from './embedded-playground/journey';
import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
  waitForWelcomeEntrance,
} from './landing-journey';

const featureStops = [
  { kicker: '01 / JSON SCHEMA', progress: 2 / 17 },
  { kicker: '02 / CLI', progress: 6 / 17 },
  { kicker: '03 / FOLDERING', progress: 9.5 / 17 },
  { kicker: '04 / COMPREHENSIVE DATA ENGINE', progress: 12 / 17 },
  { kicker: '05 / IDE PLUGINS', progress: 14 / 17 },
  { kicker: '06 / UNIFIED UI', progress: 16 / 17 },
] as const;

interface BackgroundFrame {
  height: number;
  isVisible: boolean;
  scrollY: number;
  width: number;
  x: number;
  y: number;
}

async function expectMenuOpening(
  background: Locator,
  openMenu: Locator,
): Promise<void> {
  await expect(background).toBeInViewport();

  const observation = await background.evaluateHandle((element) => {
    function readBackgroundFrame(): BackgroundFrame {
      const {
        bottom,
        height,
        left,
        right,
        top,
        width,
      } = element.getBoundingClientRect();
      const isVisible = bottom > 0 && top < window.innerHeight
        && right > 0 && left < window.innerWidth
        && element.checkVisibility({ opacityProperty: true, visibilityProperty: true });

      return { height, isVisible, scrollY: window.scrollY, width, x: left, y: top };
    }

    const frames: BackgroundFrame[] = [];
    const opening = { frames, hasFinished: false, hasSlidIn: false };

    document.addEventListener('click', () => {
      frames.push(readBackgroundFrame());

      function sampleFrame(): void {
        frames.push(readBackgroundFrame());

        const overlay = document.querySelector('[aria-label="Navigation overlay"]');
        const paper = overlay?.parentElement;

        if (paper?.checkVisibility()) {
          const { left } = paper.getBoundingClientRect();

          opening.hasSlidIn ||= left > 1 && left < window.innerWidth - 1;
          opening.hasFinished = left <= 1;
        }

        if (!opening.hasFinished) {
          requestAnimationFrame(sampleFrame);
        }
      }

      requestAnimationFrame(sampleFrame);
    }, { capture: true, once: true });

    return opening;
  });

  await openMenu.click();
  await expect.poll(() => observation.evaluate((state) => state.hasFinished))
    .toBe(true);

  const {
    frames: [before, ...during],
    hasSlidIn,
  } = await observation.jsonValue();

  await observation.dispose();

  expect(hasSlidIn).toBe(true);
  expect(before.isVisible).toBe(true);
  expect(during.find(({ isVisible }) => !isVisible)).toBeUndefined();
  expect(during.find(({ height, scrollY, width, x, y }) => (
    scrollY !== before.scrollY || Math.abs(x - before.x) > 1
    || Math.abs(y - before.y) > 1
    || Math.abs(width - before.width) > 1
    || Math.abs(height - before.height) > 1
  )), 'background stays in the same position throughout the slide').toBeUndefined();
}

test('01.22 — opening the menu during How it works holds the hero still', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await waitForWelcomeEntrance(page);
  await page.getByRole('button', { name: 'How it works', exact: true }).click();

  await expectMenuOpening(
    page.getByRole('heading', { level: 1 }),
    page.getByRole('button', { name: 'Open navigation menu' }),
  );
  await expect(page.getByRole('button', { name: 'Close navigation menu' }))
    .toBeFocused();
  expectNoDiagnostics();
});

test('02.07 — opening the menu keeps each feature chapter in place', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const openMenu = page.getByRole('button', { name: 'Open navigation menu' });
  const overlay = page.getByRole('region', { name: 'Navigation overlay' });

  for (const { kicker, progress } of featureStops) {
    await test.step(kicker, async () => {
      await scrollSecondScreenTo(page, progress);

      const chapter = page.getByText(kicker, { exact: true });

      // Let the chapter's own entrance finish before measuring the menu.
      await expect(chapter.locator('..')).toHaveCSS('opacity', '1');
      await expectMenuOpening(chapter, openMenu);
      await page.getByRole('button', { name: 'Close navigation menu' }).click();
      await expect(overlay).toBeHidden();
    });
  }

  expectNoDiagnostics();
});

test('03.04 — opening the menu keeps Ideology and the footer in place', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const openMenu = page.getByRole('button', { name: 'Open navigation menu' });
  const ideology = page.getByRole('heading', { name: 'Complexity management' });
  const footer = page.getByRole('contentinfo', { name: 'Site footer' });

  await ideology.scrollIntoViewIfNeeded();
  await expectMenuOpening(ideology, openMenu);
  await page.getByRole('button', { name: 'Close navigation menu' }).click();
  await expect(page.getByRole('region', { name: 'Navigation overlay' })).toBeHidden();

  await footer.scrollIntoViewIfNeeded();
  await expectMenuOpening(footer, openMenu);
  expectNoDiagnostics();
});

test('02.06 — opening the embedded Playground menu keeps the editor in place', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const playground = await openEmbeddedPlayground(page, 'Simplest pet store');

  const sourceEditor = playground.getByRole('code').filter({
    has: page.getByRole('textbox', { name: 'Source schema code editor', exact: true }),
  });

  await expectMenuOpening(
    sourceEditor,
    playground.getByRole('button', { name: 'Open navigation menu' }),
  );

  const navigation = page.getByRole('dialog', { name: 'Playground navigation' });

  await expect(navigation.getByRole('link', { name: 'Return to landing' }))
    .toBeVisible();
  expectNoDiagnostics();
});
