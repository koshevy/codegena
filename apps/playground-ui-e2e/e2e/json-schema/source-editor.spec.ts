import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

import {
  readClipboardWrites,
  stubClipboardWrites,
} from './clipboard';
import { observeMonacoTokenColors } from './observe-monaco-token-colors';
import { visitGeneratedFileRows } from './visit-generated-file-rows';

const referenceStoryId = 'codegena-playground-json-editor--reference-navigation';
const referenceNavigationStoryPath = getStoryUrl(referenceStoryId);

test('navigates a local $ref with Go to Definition', async ({ page }) => {
  await page.goto(referenceNavigationStoryPath);

  const sourceEditor = page.locator('.monaco-editor');
  const referenceText = sourceEditor.getByText('"#/$defs/Address~1US"', {
    exact: true,
  });

  await expect(sourceEditor).toBeVisible();
  await referenceText.click({ position: { x: 25, y: 8 } });
  await page.keyboard.press('F12');

  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('11');
});

test('navigates a local anchor and array item through references', async ({ page }) => {
  await page.goto(referenceNavigationStoryPath);

  const sourceEditor = page.locator('.monaco-editor');
  const anchorReference = sourceEditor.getByText('"#orderStatus"', { exact: true });

  await anchorReference.click({ position: { x: 25, y: 8 } });
  await page.keyboard.press('F12');
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('15');

  const arrayReference = sourceEditor.getByText(
    '"#/$defs/Items/prefixItems/0"',
    { exact: true },
  );

  await arrayReference.click({ position: { x: 25, y: 8 } });
  await page.keyboard.press('F12');
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('22');
});

test('does not follow external references into another model', async ({ page }) => {
  await page.goto(referenceNavigationStoryPath);

  const sourceEditor = page.locator('.monaco-editor');
  const externalReferenceLine = sourceEditor.locator('.view-line')
    .filter({ hasText: '"external"' });

  await externalReferenceLine.click({ position: { x: 270, y: 8 } });
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('8');
  await page.keyboard.press('F12');
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('8');
});

test('disables schema requests while keeping Codegena warnings', async ({ page }) => {
  let schemaRequests = 0;

  await page.route('https://json-schema.org/draft/2020-12/schema', async (route) => {
    schemaRequests += 1;

    await route.fulfill({ json: {} });
  });

  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const sourceEditor = page.locator('.Playground__source .monaco-editor');

  await expect(sourceEditor).toBeVisible();
  await sourceEditor.click({ position: { x: 100, y: 40 } });
  await page.keyboard.press('F8');
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('271');

  expect(schemaRequests).toBe(0);
});

test('copies the current edited source schema and shows feedback', async ({ page }) => {
  await stubClipboardWrites(page);
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const copyButton = page.getByRole('button', { name: 'Copy whole schema' });
  const sourceEditor = page.locator('.Playground__source .monaco-editor');

  await copyButton.click();
  await expect.poll(() => readClipboardWrites(page)).toHaveLength(1);
  await expect(page.getByText('Source schema copied', { exact: true })).toBeVisible();

  const [initialText] = await readClipboardWrites(page);

  await sourceEditor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type('COPY_PROBE');

  await expect(sourceEditor).toContainText('COPY_PROBE');
  await copyButton.click();

  await expect.poll(() => readClipboardWrites(page)).toHaveLength(2);

  const [, editedText] = await readClipboardWrites(page);

  expect(editedText).toContain('COPY_PROBE');
  expect(editedText.replace('COPY_PROBE', '')).toBe(initialText);
});

test('keeps Monaco actions in the source editor context menu', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const sourceEditor = page.locator('.Playground__source .monaco-editor');

  await sourceEditor.click({ button: 'right' });

  const menu = page.getByRole('menu', { name: 'Code editor actions' });

  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'Copy' })).toBeEnabled();
  await expect(menu.getByRole('menuitem', { name: 'Paste' })).toBeEnabled();

  await menu.getByRole('menuitem', { name: 'Go to Symbol' }).click();

  await expect(page.locator('.quick-input-widget')).toBeVisible();
});

test('keeps the source editor mounted while generated files scroll', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const sourceEditor = page.locator('.Playground__source .monaco-editor').first();

  await expect(sourceEditor).toBeVisible();

  const originalEditor = await sourceEditor.elementHandle();

  expect(originalEditor).not.toBeNull();

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const fileDetails = page.locator('.GeneratedFileDetails__root');

  await fileDetails.evaluate((element) => {
    element.scrollTop = element.scrollHeight / 2;
  });

  await expect(fileDetails.locator('.monaco-editor').first()).toBeVisible();

  const currentEditor = await sourceEditor.elementHandle();

  expect(currentEditor).not.toBeNull();

  const isSameEditor = await page.evaluate(
    ([original, current]) => original === current,
    [originalEditor, currentEditor],
  );

  expect(isSameEditor).toBe(true);
});

test('keeps source state while every generated editor mounts', async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const sourceEditor = page.locator('.Playground__source .monaco-editor');
  const sourceInput = sourceEditor.getByRole('textbox', {
    name: 'Source schema code editor',
  });

  await expect(sourceEditor).toBeVisible();
  await expect(sourceInput).toHaveAttribute('aria-label', 'Source schema code editor');

  const originalEditor = await sourceEditor.elementHandle();
  const originalModelUri = await sourceEditor.getAttribute('data-uri');

  await sourceEditor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type('UNDO_PROBE');

  await expect(sourceEditor).toContainText('UNDO_PROBE');
  await expect(sourceInput).toBeFocused();

  await page.keyboard.press('Control+z');
  await expect(sourceEditor).not.toContainText('UNDO_PROBE');

  await page.keyboard.type('UNDO_PROBE');
  await expect(sourceEditor).toContainText('UNDO_PROBE');

  const sourceScroll = sourceEditor.locator(
    '.monaco-scrollable-element.editor-scrollable',
  );
  const cursor = sourceEditor.locator('.cursor').first();

  await sourceScroll.evaluate((element) => {
    element.scrollTop = 0;
  });

  const sourceScrollTop = await sourceScroll.evaluate((element) => element.scrollTop);
  const cursorPosition = await cursor.evaluate((element) => ({
    left: element.style.left,
    top: element.style.top,
  }));

  const readTokenColors = (): Promise<string[]> => sourceEditor
    .locator('.view-line span[class*="mtk"]')
    .evaluateAll((tokens) => tokens.slice(0, 80).map(
      (token) => getComputedStyle(token).color,
    ));

  await page.getByRole('button', { name: 'Show details' }).click();

  await expect.poll(async () => {
    const initialTokenColors = await readTokenColors();
    const uniqueInitialColors = new Set(initialTokenColors);

    return uniqueInitialColors.size;
  })
    .toBeGreaterThan(1);

  let previousTokenColors = '';
  let stableColorSamples = 0;

  await expect.poll(async () => {
    const colors = await readTokenColors();
    const uniqueColors = new Set(colors);

    if (uniqueColors.size <= 1) {
      previousTokenColors = '';
      stableColorSamples = 0;

      return stableColorSamples;
    }

    const sampledColorSignature = JSON.stringify(colors);

    stableColorSamples = sampledColorSignature === previousTokenColors
      ? stableColorSamples + 1
      : 0;
    previousTokenColors = sampledColorSignature;

    return stableColorSamples;
  }, { intervals: [100] }).toBeGreaterThanOrEqual(3);

  const tokenColors = await readTokenColors();
  const uniqueTokenColors = new Set(tokenColors);

  expect(uniqueTokenColors.size).toBeGreaterThan(1);

  const stopObservingTokenColors = await observeMonacoTokenColors(sourceEditor);

  await page.getByRole('button', { name: 'Show all' }).click();

  const fileDetails = page.locator('.GeneratedFileDetails__root');

  await visitGeneratedFileRows(fileDetails, async (renderedRows) => {
    await expect.poll(async () => renderedRows.evaluateAll((rows) => rows.every(
      (row) => {
        const headerName = row.querySelector('[role="group"]')
          ?.getAttribute('aria-label');
        const fileName = headerName?.replace(/^Details header for /, '');
        const editorInput = row.querySelector('[role="textbox"]');

        return editorInput?.getAttribute('aria-label')
          === `Generated code editor for ${fileName}`;
      },
    ))).toBe(true);

    await expect(sourceEditor).toHaveAttribute('data-uri', originalModelUri ?? '');
  });

  const colorObservation = await stopObservingTokenColors();

  expect(colorObservation.sampleCount).toBeGreaterThan(1);
  expect(colorObservation.uncoloredSamples).toEqual([]);

  const currentEditor = await sourceEditor.elementHandle();
  const isSameEditor = await page.evaluate(
    ([original, current]) => original === current,
    [originalEditor, currentEditor],
  );

  expect(isSameEditor).toBe(true);
  expect(await sourceScroll.evaluate(
    (element) => element.scrollTop,
  )).toBe(sourceScrollTop);
  expect(await cursor.evaluate((element) => ({
    left: element.style.left,
    top: element.style.top,
  }))).toEqual(cursorPosition);

  const currentTokenColors = await readTokenColors();
  const uniqueCurrentTokenColors = new Set(currentTokenColors);

  expect(uniqueCurrentTokenColors.size).toBeGreaterThan(1);

  await sourceEditor.click();
  await page.keyboard.press('ControlOrMeta+End');

  await expect(sourceEditor).toContainText('UNDO_PROBE');

  await page.keyboard.press('Control+z');

  await expect(sourceEditor).not.toContainText('UNDO_PROBE');
  await expect(sourceEditor).toHaveAttribute('data-uri', originalModelUri ?? '');
});

test('explains a source declaration glyph with a themed tooltip', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--light'));

  const sourceGlyph = page.locator('.Playground__source').getByRole('button', {
    name: 'Reveal generated declarations for line 1',
    exact: true,
  });

  await sourceGlyph.getByRole('img').hover();
  await expect(page.getByRole('tooltip', {
    name: 'Click to reveal generated code and hierarchy',
  })).toBeVisible();
});

test('centers source and generated declaration glyphs on their code lines', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--light'));
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const sourceGlyph = page.getByRole('button', {
    name: 'Reveal generated declarations for line 1',
    exact: true,
  });
  const generatedGlyph = page.getByRole('button', {
    name: 'Reveal Account in source schema at line 1',
  });

  for (const glyph of [sourceGlyph, generatedGlyph]) {
    await expect(glyph).toBeVisible();

    const centerOffset = await glyph.getByRole('img').evaluate((icon) => {
      const widget = icon.closest('.glyph-margin-widgets > div');

      if (!widget) {
        throw new Error('Monaco glyph line was not found');
      }

      const iconBounds = icon.getBoundingClientRect();
      const widgetBounds = widget.getBoundingClientRect();

      return Math.abs(
        iconBounds.top + iconBounds.height / 2
        - widgetBounds.top - widgetBounds.height / 2,
      );
    });

    expect(centerOffset).toBeLessThan(1);
  }
});
