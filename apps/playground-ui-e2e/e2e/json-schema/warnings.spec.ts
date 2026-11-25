import { getStoryUrl } from '@codegena/util-e2e';
import { expect, type Locator, type Page, test } from '@playwright/test';

import {
  readClipboardWrites,
  stubClipboardWrites,
} from './clipboard';

const anotherForbiddenPropertyPath = [
  '$defs.AllOfCases.InlineObjectCompositionPatterns',
  'allOf.3.not.additionalProperties.properties.anotherForbiddenProperty',
].join('.');

async function hoverWarningOnLine(
  page: Page,
  sourceEditor: Locator,
  line: number,
): Promise<void> {
  const lineTop = await sourceEditor.locator('.line-numbers')
    .filter({ hasText: new RegExp(`^${line}$`) })
    .evaluate((number) => (number.parentElement?.style.top));

  // Hover the rendered line so Playwright waits for Monaco's scroll to settle.
  const sourceLine = sourceEditor.locator(`.view-line[style*="top:${lineTop};"]`);

  await sourceLine.hover({ position: { x: 12, y: 2 } });
  await expect(page.getByRole('link', { name: 'View in file details' }))
    .toBeVisible();
}

async function openComprehensiveGraphAndSelectedDetails(
  page: Page,
): Promise<void> {
  await page.goto(getStoryUrl('codegena-playground--comprehensive-with-persistence'));

  const graphMode = page.getByRole('button', { name: 'Graph', exact: true });

  await expect(graphMode).toBeVisible();

  const showSource = page.getByRole('button', { name: 'Show source schema' });

  if (await showSource.isVisible()) {
    await showSource.click();
  }

  const showDetails = page.getByRole('button', { name: 'Show details' });

  if (await showDetails.isVisible()) {
    await showDetails.click();
  }

  if (await graphMode.getAttribute('aria-pressed') !== 'true') {
    await graphMode.click();
  }

  const showSelected = page.getByRole('button', { name: 'Show selected' });

  if (await showSelected.getAttribute('aria-pressed') !== 'true') {
    await showSelected.click();
  }
}

[
  { line: 271, col: 47 },
  { line: 409, col: 19 },
  { line: 934, col: 22 },
].forEach(({ line, col }) => {
  test(`reveals source warning at line ${line} twice`, async ({ page }) => {
    await page.goto(getStoryUrl('codegena-playground--comprehensive'));

    const sourceEditor = page.locator('.Playground__source .monaco-editor');

    await sourceEditor.click({ position: { x: 100, y: 40 } });
    await page.keyboard.press('Control+g');
    await page.keyboard.insertText(String(line));
    await page.keyboard.press('Enter');

    await expect(sourceEditor.locator('.line-numbers.active-line-number'))
      .toHaveText(String(line));

    await hoverWarningOnLine(page, sourceEditor, line);
    await page.getByRole('link', { name: 'View in file details' }).click();

    const focusedWarning = page.locator('[data-details-row="warning"]')
      .filter({ hasText: `comprehensive.jsonc:${line}:${col}` });

    await expect(focusedWarning).toBeInViewport({ ratio: 0.5 });
    await expect(focusedWarning).toHaveClass(/RevealHighlight--active/);
    await expect(focusedWarning).not.toHaveClass(/RevealHighlight--active/);

    await page.mouse.move(0, 0);
    await hoverWarningOnLine(page, sourceEditor, line);
    await page.getByRole('link', { name: 'View in file details' }).click();

    await expect(focusedWarning).toBeInViewport({ ratio: 0.5 });
    await expect.poll(() => focusedWarning.evaluate((element) => (
      element.getAnimations({ subtree: true })
        .some((animation) => animation.playState === 'running')
    ))).toBe(true);
  });
});

test('shows Codegena warnings in Monaco at their source locations', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const sourceEditor = page.locator('.Playground__source .monaco-editor');

  await expect(sourceEditor).toBeVisible();
  await sourceEditor.click({ position: { x: 100, y: 40 } });
  await page.keyboard.press('F8');

  await expect(page.getByText(
    `Property at "${anotherForbiddenPropertyPath}" was processed as \`unknown\`.`,
  )).toBeVisible();
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('271');

  const highlightedCharacterCount = await sourceEditor
    .locator('.squiggly-warning')
    .first()
    .evaluate((marker) => {
      const line = marker.closest('.monaco-editor')?.querySelector('.view-line');
      const context = document.createElement('canvas').getContext('2d');

      if (!line || !context) {
        return 0;
      }

      const style = getComputedStyle(line);

      context.font = `${style.fontSize} ${style.fontFamily}`;

      return marker.getBoundingClientRect().width / context.measureText('{').width;
    });

  expect(highlightedCharacterCount).toBeGreaterThan(1.5);
});

test('reveals a Monaco warning in generated file details', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const sourceEditor = page.locator('.Playground__source .monaco-editor');

  await expect(sourceEditor).toBeVisible();
  await sourceEditor.click({ position: { x: 100, y: 40 } });
  await page.keyboard.press('F8');

  await page.getByRole('link', { name: 'View in file details' }).click();

  const focusedWarning = page.locator('[data-details-row="warning"]')
    .filter({ hasText: 'comprehensive.jsonc:271:47' });

  await expect(focusedWarning).toBeInViewport({ ratio: 0.5 });
  await expect(focusedWarning).toHaveClass(/RevealHighlight--active/);
});

test('shows a left-aligned warning with a themed Monaco hover', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const sourceEditor = page.locator('.Playground__source .monaco-editor');
  const sourceInput = page.getByRole('textbox', { name: 'Source schema code editor' });

  await sourceInput.focus();
  await sourceInput.press('F8');
  await sourceInput.press('Escape');

  const warningMarker = sourceEditor.locator('.squiggly-warning').first();

  await expect(warningMarker).toHaveCSS('left', '0px');

  await sourceEditor.getByText('"anotherForbiddenProperty"', { exact: true }).hover();

  const warningHover = sourceEditor.locator('.monaco-hover')
    .filter({ has: page.getByRole('link', { name: 'View in file details' }) });

  await expect(warningHover).toBeVisible();
  await expect(warningHover).toHaveCSS('border-top-width', '0px');
  await expect(warningHover).toHaveCSS('font-family', /Golos Text/);
  await expect(warningHover.locator('.hover-row.status-bar')).toBeHidden();

  const hoverOverflow = await warningHover.evaluate((hover) => {
    const editor = document.querySelector('.Playground__source .monaco-editor');

    if (!editor) {
      return Infinity;
    }

    return hover.getBoundingClientRect().right
      - editor.getBoundingClientRect().right;
  });

  expect(hoverOverflow).toBeLessThanOrEqual(1);

  const hoverFrame = sourceEditor.locator(
    '.monaco-resizable-hover:has(a.code-link[href^="codegena-warning:"])',
  );

  await expect(hoverFrame).toHaveCSS('box-shadow', /rgba/);
  await expect(sourceEditor.locator('.view-line').first())
    .toHaveCSS('font-family', /JetBrains Mono/);
});

test('reveals all warnings from the details shortcut', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  await expect(page.getByRole('group', { name: 'Generated output header' }))
    .toBeVisible();

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const warningShortcut = page.getByRole('button', {
    name: 'Scroll to warnings in generated file details',
  });

  await expect(warningShortcut).toBeVisible();
  await warningShortcut.click();

  await expect(page.getByText('Warnings', { exact: true })).toBeInViewport();
  await expect(page.getByRole('article', { name: /^Warning:/ }).first()).toBeInViewport();
});

test('graph warning reveal shows the warning and hides the shortcut', async ({
  page,
}) => {
  await openComprehensiveGraphAndSelectedDetails(page);

  const graphWarningIcon = page.getByRole('button', {
    name: /^Reveal warnings for /,
  }).first();

  await graphWarningIcon.click();

  const details = page.getByRole('region', {
    name: 'Generated file details',
  });
  const warning = details.getByRole('article', {
    name: /^Warning: comprehensive\.jsonc:/,
  }).first();
  const warningShortcut = page.getByRole('button', {
    name: 'Scroll to warnings in generated file details',
  });

  await expect(warning).toBeInViewport({ ratio: 0.6 });
  await expect(warning).toContainText('comprehensive.jsonc:');
  await expect(warningShortcut).toBeHidden();
});

test('reveals and highlights the exact warning in the virtual list', async ({ page }) => {
  const storyId = [
    'codegena-playground-generated-file-details',
    'interactive-warning-reveal',
  ].join('--');

  await page.goto(getStoryUrl(storyId));
  await page.getByRole('button', { name: 'Reveal warning' }).click();

  const focusedWarning = page.locator('[data-details-row="warning"]')
    .filter({ hasText: 'account-with-warning.schema.jsonc:7:13' });

  await expect(focusedWarning).toBeInViewport();
  await expect(focusedWarning).toHaveClass(/RevealHighlight--active/);

  await page.locator('[data-details-row="file"]').first().scrollIntoViewIfNeeded();
  await expect(focusedWarning).not.toBeInViewport({ ratio: 0.5 });

  await page.getByRole('button', { name: 'Reveal warning' }).click();

  await expect(focusedWarning).toBeInViewport({ ratio: 0.5 });
  await expect(focusedWarning).toHaveClass(/RevealHighlight--active/);
});

test('copies one warning with its source excerpt and shows success', async ({ page }) => {
  await stubClipboardWrites(page);

  await page.goto(getStoryUrl('codegena-playground--comprehensive'));
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', {
    name: 'Scroll to warnings in generated file details',
  }).click();

  const firstWarning = page.getByRole('article', { name: /^Warning:/ }).first();

  await expect(firstWarning).toContainText('comprehensive.jsonc:271:47');
  await firstWarning.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Copy warning' }).click();

  const expectedClipboardText = [
    'Warning (comprehensive.jsonc:271:47):',
    `Property at "${anotherForbiddenPropertyPath}" was processed as \`unknown\`.`,
    '  270 |                 "properties": {',
    '> 271 |                   "anotherForbiddenProperty": {}',
    `      | ${' '.repeat(46)}^`,
    '  272 |                 }',
  ].join('\n');

  await expect.poll(() => readClipboardWrites(page)).toEqual([expectedClipboardText]);
  await expect(page.getByText('Warning copied', { exact: true })).toHaveCount(1);
});

test('copies all displayed warnings in source order with count-aware feedback', async ({
  page,
}) => {
  await stubClipboardWrites(page);
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const warningCount = Number(await page.locator('[data-warning-count]')
    .getAttribute('data-warning-count'));
  const initiallyMountedWarnings = await page.getByRole('article', {
    name: /^Warning:/,
  }).count();

  expect(warningCount).toBeGreaterThan(initiallyMountedWarnings);

  await page.getByRole('button', {
    name: 'Scroll to warnings in generated file details',
  }).click();

  expect(warningCount).toBeGreaterThan(1);

  await page.getByText('Warnings', { exact: true }).click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Copy all warnings' }).click();

  await expect.poll(async () => {
    const clipboardWrites = await readClipboardWrites(page);

    return clipboardWrites.length;
  }).toBe(1);

  const [copiedText] = await readClipboardWrites(page);
  const copiedWarnings = copiedText.split(/\n\n(?=(?:Warning|Error) \()/);

  expect(copiedWarnings).toHaveLength(warningCount);

  const lineNumbers = copiedWarnings.map((warning) => Number(
    warning.match(/^Warning \([^:]+:(\d+):\d+\):/)?.[1],
  ));

  expect(lineNumbers.every((lineNumber) => Number.isFinite(lineNumber))).toBe(true);
  expect(lineNumbers).toEqual(lineNumbers.toSorted((first, second) => first - second));

  copiedWarnings.forEach((copiedWarning) => {
    expect(copiedWarning).toMatch(/^>\s+\d+\s+\|\s+.+$/m);
    expect(copiedWarning).toMatch(/^\s+\|\s+\^$/m);
  });

  await expect(page.getByText(
    `${warningCount} warnings copied`,
    { exact: true },
  )).toHaveCount(1);
});
