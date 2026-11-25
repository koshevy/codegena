import { expect, type Locator, type Page, test } from '@playwright/test';
import assert from 'node:assert/strict';

import {
  observeLandingDiagnostics,
  scrollLandingTo,
  scrollSecondScreenTo,
  swipeTouch,
  waitForGeneratedCodeIllustration,
  waitForLandingScrollbar,
} from './landing-journey';

const examples = [
  {
    description: 'combines object rules and patterned keys',
    fileName: 'inline-object-composition-patterns.ts',
    typeName: 'InlineObjectCompositionPatterns',
  },
  {
    description: 'is a standalone object declaration',
    fileName: 'activity/api-request.ts',
    typeName: 'ApiRequest',
  },
  {
    description: 'reference one another',
    fileName: 'first-level.ts',
    typeName: 'FirstLevel',
  },
  {
    description: 'becomes a tuple with two required',
    fileName: 'array-min-scalar.ts',
    typeName: 'ArrayMinScalar',
  },
] as const;

async function swipeCode(
  page: Page,
  editor: Locator,
  delta: { x: number; y: number },
): Promise<void> {
  const box = await editor.boundingBox();
  const viewport = page.viewportSize();

  assert(box && viewport, 'The editor should be visible in the viewport.');

  const x = box.x + box.width * 0.65;
  const y = Math.min(box.y + box.height / 2, viewport.height - 12);

  await swipeTouch(page, { x, y }, delta);
}

async function prepareCodeExampleScreenshot(
  page: Page,
  exampleIndex: number,
  isMobile: boolean,
): Promise<void> {
  const hasVisibleScrollbar = exampleIndex === 0 && !isMobile;

  if (hasVisibleScrollbar) {
    // The opening desktop frame includes the scroll position on entry.
    await page.mouse.move(0, 0);
  }

  await waitForLandingScrollbar(page, hasVisibleScrollbar);
}

test('02.01 — JSON Schema story presents every generated-code example', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const editorRequests: string[] = [];

  page.on('request', (request) => {
    const { pathname } = new URL(request.url());

    if (/(?:\/monaco\/|\/monaco-full-editor[.-])/.test(pathname)) {
      editorRequests.push(pathname);
    }
  });

  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, 1900);
  await waitForGeneratedCodeIllustration(page);

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });
  const carousel = playground.getByRole('region', {
    name: 'Generated TypeScript examples',
  });
  const heading = playground.getByRole('heading', {
    name: 'Most detailed JSON Schema support',
  });

  await expect(playground.getByText('01 / JSON SCHEMA')).toBeVisible();
  await expect(heading).toBeVisible();
  await expect(playground.getByText('Codegena resolves related JSON Schema parts', {
    exact: false,
  })).toBeVisible();
  await expect(carousel).toBeVisible();
  expectNoDiagnostics();

  // Offscreen examples already have highlighted source before anyone selects them.
  const highlightedSlides = carousel.locator('pre > code').filter({
    has: page.locator('[data-token="keyword"]'),
  });

  await expect(highlightedSlides).toHaveCount(examples.length);
  await expect(carousel.locator('.monaco-editor')).toHaveCount(0);

  const activeEditor = carousel.getByRole('region', {
    name: /^Generated code editor for /,
  });
  const editorHeight = await activeEditor.evaluate((element) => element.clientHeight);
  const pageScrollTop = await page.evaluate(() => window.scrollY);

  for (const [index, example] of examples.entries()) {
    const bullet = carousel.getByRole('button', {
      name: `Show code example ${index + 1}: ${example.fileName}`,
    });

    await bullet.click();

    await expect(bullet).toHaveAttribute('aria-current', 'true');

    await expect(carousel.getByRole('group', {
      name: `Example ${index + 1}/${examples.length}: ${example.fileName}`,
    })).toBeVisible();
    await expect(page.getByRole('group', {
      name: `Details header for ${example.fileName}`,
    })).toBeVisible();
    await expect(page.getByRole('region', {
      name: `Generated code editor for ${example.fileName}`,
    })).toBeAttached();
    await expect(activeEditor).toHaveCount(1);
    expect(await activeEditor.evaluate((element) => element.clientHeight))
      .toBe(editorHeight);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollTop);
    await expect(carousel.getByRole('group', {
      name: `Example ${index + 1}/${examples.length}: ${example.fileName}`,
    })).toContainText(example.typeName);
    await expect(carousel.getByText(example.description, { exact: false })).toBeVisible();
    await heading.click();
    await expect(page.getByRole('tooltip')).toBeHidden();
    await prepareCodeExampleScreenshot(page, index, isMobile);
    await expect.soft(page).toHaveScreenshot(`02-01-example-${index + 1}.png`);
    expectNoDiagnostics();
  }

  expect(editorRequests).toEqual([]);
});

test('02.01 — page scroll selects each JSON Schema code example', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const carousel = page.getByRole('region', {
    name: 'Generated TypeScript examples',
  });

  for (const [index, example] of examples.entries()) {
    const sectionProgress = (index + 0.5) / examples.length;

    await scrollSecondScreenTo(page, sectionProgress * 4 / 17);

    const bullet = carousel.getByRole('button', {
      name: `Show code example ${index + 1}: ${example.fileName}`,
    });

    await expect(bullet).toHaveAttribute('aria-current', 'true');
    await expect(carousel.getByRole('group', {
      name: `Example ${index + 1}/${examples.length}: ${example.fileName}`,
    })).toBeVisible();
    expectNoDiagnostics();
  }

  await scrollSecondScreenTo(page, 0.35 * 4 / 17);

  await expect(carousel.getByRole('button', {
    name: `Show code example 2: ${examples[1].fileName}`,
  })).toHaveAttribute('aria-current', 'true');
  expectNoDiagnostics();
});

test('02.01 — wheel scroll stays inside the code slide', {
  tag: '@desktop-touchpad',
}, async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, 1900);
  await waitForGeneratedCodeIllustration(page);

  const editor = page.getByRole('region', {
    name: `Generated code editor for ${examples[0].fileName}`,
  });
  const pageScrollTop = await page.evaluate(() => window.scrollY);

  await editor.hover();
  await page.mouse.wheel(0, 120);
  await expect.poll(() => editor.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollTop);
  expectNoDiagnostics();
});

test('02.01 — touch scroll reads code before expanding its drawer', {
  tag: '@mobile-peel',
}, async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const { fileName } = examples[0];

  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, 1900);
  await waitForGeneratedCodeIllustration(page);

  const editor = page.getByRole('region', {
    name: `Generated code editor for ${fileName}`,
  });
  const drawer = page.getByRole('dialog', { name: `code example: ${fileName}` });
  const pageScrollTop = await page.evaluate(() => window.scrollY);

  await swipeCode(page, editor, { x: 0, y: -72 });
  await expect.poll(() => editor.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await swipeCode(page, editor, { x: -96, y: 0 });
  await expect.poll(() => editor.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await expect(drawer).toBeHidden();
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollTop);

  await page.getByRole('button', { name: `Expand code example ${fileName}` }).click();
  await expect(drawer).toBeVisible();

  const expandedEditor = drawer.getByRole('region', {
    name: `Generated code editor for ${fileName}`,
  });
  const expandedScrollTop = await expandedEditor.evaluate((element) => element.scrollTop);

  await swipeCode(page, expandedEditor, { x: 0, y: -72 });
  await expect.poll(() => expandedEditor.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(expandedScrollTop);
  expectNoDiagnostics();
});
