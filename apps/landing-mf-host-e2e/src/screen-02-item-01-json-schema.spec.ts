import { expect, test } from '@playwright/test';
import assert from 'node:assert/strict';

import {
  observeLandingDiagnostics,
  scrollLandingTo,
  scrollSecondScreenTo,
  waitForGeneratedCodeIllustration,
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

test('02.01 — JSON Schema story presents every generated-code example', async ({
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

  const carouselBounds = await carousel.boundingBox();

  assert(carouselBounds, 'The carousel should have a measurable layout.');

  for (const [index, example] of examples.entries()) {
    const bullet = carousel.getByRole('button', {
      name: `Show code example ${index + 1}: ${example.fileName}`,
    });

    await bullet.click();

    await expect(bullet).toHaveAttribute('aria-current', 'true');

    const selectedBounds = await carousel.boundingBox();

    expect(selectedBounds?.height).toBe(carouselBounds.height);
    await expect(carousel.getByRole('group', {
      name: `Example ${index + 1}/${examples.length}: ${example.fileName}`,
    })).toBeVisible();
    await expect(page.getByRole('group', {
      name: `Details header for ${example.fileName}`,
    })).toBeVisible();
    await expect(page.getByRole('region', {
      name: `Generated code editor for ${example.fileName}`,
    })).toBeAttached();
    await expect(carousel.getByRole('region', {
      name: /^Generated code editor for /,
    })).toHaveCount(1);
    await expect(carousel.getByRole('group', {
      name: `Example ${index + 1}/${examples.length}: ${example.fileName}`,
    })).toContainText(example.typeName);
    await expect(carousel.getByText(example.description, { exact: false })).toBeVisible();
    await heading.click();
    await expect(page.getByRole('tooltip')).toBeHidden();
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
