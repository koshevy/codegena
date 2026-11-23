import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Records browser diagnostics from the first page load onward.
 */
export function observeLandingDiagnostics(page: Page): () => void {
  const messages: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error' && message.type() !== 'warning') {
      return;
    }

    const { lineNumber, url } = message.location();
    const location = url ? ` (${url}:${lineNumber + 1})` : '';

    messages.push(`${message.type()}: ${message.text()}${location}`);
  });

  page.on('pageerror', (error) => {
    messages.push(`page error: ${error.stack ?? error.message}`);
  });

  return () => expect(messages).toEqual([]);
}

/** Stops at a repeatable point on the user's vertical scroll path. */
export async function scrollLandingTo(page: Page, top: number): Promise<void> {
  await page.getByRole('region', { name: 'Welcome' }).waitFor({ state: 'visible' });

  await expect(page.getByRole('region', {
    name: 'Landing feature sections',
  })).toBeAttached();

  await page.evaluate((offset) => {
    window.scrollTo({ top: offset, behavior: 'instant' });
  }, top);

  await expect.poll(async () => page.evaluate((offset) => (
    Math.abs(window.scrollY - offset)
  ), top)).toBeLessThan(2);

  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  }));
}

/** Stops at a chosen point in the second screen's pinned scroll path. */
export async function scrollSecondScreenTo(
  page: Page,
  progress: number,
): Promise<void> {
  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });
  const scrollPoint = await playground.evaluate((element, storyProgress) => {
    const { height, top } = element.getBoundingClientRect();
    const storyTravel = height - window.innerHeight;

    return Math.ceil(window.scrollY + top + storyTravel * storyProgress);
  }, progress);

  await scrollLandingTo(page, scrollPoint);
}

/** Waits for the entrance motion before capturing a scroll phase. */
export async function waitForWelcomeEntrance(page: Page): Promise<void> {
  const heading = page.getByRole('heading', { level: 1 });

  await expect.poll(async () => heading.evaluate((element) => {
    const animatedContent = element.parentElement;

    return animatedContent
      ? getComputedStyle(animatedContent).opacity
      : null;
  })).toBe('1');
}

/**
 * Holds a decorative SVG at a chosen time for repeatable screenshots.
 */
export async function freezeSvgAnimation(
  image: Locator,
  timeSeconds = 0,
): Promise<void> {
  await image.evaluate((element, seconds) => {
    if (!(element instanceof SVGSVGElement)) {
      throw new TypeError('The image must be an SVG element.');
    }

    element.pauseAnimations();
    element.setCurrentTime(seconds);
  }, timeSeconds);
}

/**
 * Waits for the illustration placement before interacting with its content.
 */
export async function waitForPlaygroundIllustration(page: Page): Promise<void> {
  const illustration = page.getByRole('group', {
    name: 'Feature illustration',
  });

  await expect.poll(async () => illustration.evaluate((element) => {
    const transform = new DOMMatrix(getComputedStyle(element).transform);

    return Math.abs(transform.a - 1) < 0.005
      && Math.abs(transform.m41) < 0.5;
  })).toBe(true);
}

/**
 * Waits for the code illustration's entrance to finish before capturing its canvas.
 */
export async function waitForGeneratedCodeIllustration(page: Page): Promise<void> {
  const illustration = page.getByRole('group', {
    name: 'Feature illustration',
  }).filter({
    has: page.getByRole('region', { name: 'Generated TypeScript examples' }),
  });

  await expect(illustration).toHaveCSS('transform', 'none');
}
