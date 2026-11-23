import { expect, type Page, test } from '@playwright/test';
import { strFromU8, unzipSync } from 'fflate';
import { readFile } from 'node:fs/promises';

import {
  readClipboardWrites,
  stubClipboardWrites,
} from './clipboard';
import { visitGeneratedFileRows } from './visit-generated-file-rows';
import { withUpdatedStorybookOutput } from './with-updated-storybook-output';

const detailsStory = '/iframe.html?id=codegena-playground-generated-file-details--';
const expectedAccountFileText = [
  'import type { Status } from \'./status\';',
  '',
  '/**',
  ' * ## Account',
  ' */',
  'export interface Account {',
  '  id: string;',
  '  status: Status;',
  '  role?: \'member\' | \'admin\';',
  '}',
].join('\n');

test('focuses the last clicked declaration in a multi-selection', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=codegena-playground--comprehensive&viewMode=story',
  );

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const file = page.locator('[data-node-id="first-level.ts"]');
  const secondLevel = page.locator(
    '[data-node-id="first-level.ts::SecondLevel"]',
  );
  const firstLevel = page.locator(
    '[data-node-id="first-level.ts::FirstLevel"]',
  );

  await file.click();
  await secondLevel.click();
  await expect(secondLevel).toHaveAttribute('aria-checked', 'true');
  await firstLevel.click({ modifiers: ['Shift'] });

  const card = page.locator('.GeneratedFileDetailsFile__root').filter({
    has: page.getByText('first-level.ts', { exact: true }),
  });

  await expect(card).toBeVisible();
  await expect(card.locator('.monaco-editor .line-numbers.active-line-number'))
    .toHaveText('4');
});

test('selects files from details headers in graph and list views', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const accountButton = page.getByRole('button', {
    name: 'Toggle selection of account.ts in generated output',
  });
  const statusButton = page.getByRole('button', {
    name: 'Toggle selection of status.ts in generated output',
  });
  const graphView = page.locator('.react-flow');
  const accountGraphNode = graphView.locator('[data-id="account.ts"]');
  const statusGraphNode = graphView.locator('[data-id="status.ts"]');

  await accountButton.getByText('account.ts').click();
  await expect(accountButton).toHaveAttribute('aria-pressed', 'true');
  await expect(accountGraphNode).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(accountGraphNode).toBeInViewport();

  await statusButton.locator('svg').first().click({ modifiers: ['Shift'] });
  await expect(accountGraphNode).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(statusGraphNode).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(statusButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Show all' }))
    .toHaveAttribute('aria-pressed', 'true');
  await expect(accountButton).toBeVisible();
  await expect(statusButton).toBeVisible();

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const accountTreeItem = page.locator('[data-node-id="account.ts"]');
  const statusTreeItem = page.locator('[data-node-id="status.ts"]');

  await expect(accountTreeItem).toHaveAttribute('aria-checked', 'true');
  await expect(statusTreeItem).toHaveAttribute('aria-checked', 'true');

  await statusButton.getByText('status.ts').click();
  await expect(accountButton).toHaveAttribute('aria-pressed', 'false');
  await expect(statusTreeItem).toHaveAttribute('aria-checked', 'true');
  await expect(statusTreeItem).toBeInViewport();
  await expect(accountTreeItem).toHaveAttribute('aria-checked', 'false');

  await accountButton.locator('svg').first().click({ modifiers: ['Shift'] });
  await expect(accountTreeItem).toHaveAttribute('aria-checked', 'true');
  await expect(statusTreeItem).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('button', { name: 'Show all' }))
    .toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Show selected' }).click();
  await expect(accountButton).toHaveCount(0);

  const staticAccountCard = page.locator('.GeneratedFileDetailsFile__root')
    .filter({
      has: page.getByRole('group', {
        name: 'Details header for account.ts',
      }),
    });

  await staticAccountCard.getByText('account.ts', { exact: true }).click();
  await staticAccountCard.getByRole('img', { name: 'TypeScript' }).click();
  await expect(accountTreeItem).toHaveAttribute('aria-checked', 'true');
  await expect(statusTreeItem).toHaveAttribute('aria-checked', 'true');
});

test('reveals a distant file after Shift-selecting its details header', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=codegena-playground--comprehensive&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const firstFileId = 'another-simple-object-with-properties.ts';
  const details = page.locator('.GeneratedFileDetails__root');
  const firstFileButton = page.getByRole('button', {
    name: `Toggle selection of ${firstFileId} in generated output`,
  });
  const zeroLevelTreeItem = page.locator('[data-node-id="zero-level.ts"]');

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await zeroLevelTreeItem.click();
  await page.getByRole('button', { name: 'Graph', exact: true }).click();
  await details.evaluate((element) => {
    element.scrollTop = 0;
  });
  await firstFileButton.click({ modifiers: ['Shift'] });

  const graphView = page.locator('.react-flow');
  const firstGraphNode = graphView.locator(
    `[data-id="${firstFileId}"]`,
  );

  await expect(firstGraphNode).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(firstGraphNode).toBeInViewport();

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await zeroLevelTreeItem.click();
  await details.evaluate((element) => {
    element.scrollTop = 0;
  });
  await firstFileButton.click({ modifiers: ['Shift'] });

  const firstTreeItem = page.locator(
    `[data-node-id="${firstFileId}"]`,
  );

  await expect(zeroLevelTreeItem).toHaveAttribute('aria-checked', 'true');
  await expect(firstTreeItem).toHaveAttribute('aria-checked', 'true');
  await expect(firstTreeItem).toBeInViewport();
});

test('reveals source lines from generated declaration glyphs', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const sourceEditor = page.locator('.Playground__source .monaco-editor');
  const accountGlyph = page.getByRole('button', {
    name: 'Reveal Account in source schema at line 1',
  });
  const statusGlyph = page.getByRole('button', {
    name: 'Reveal Status in source schema at line 11',
  });

  await expect(accountGlyph).toBeVisible();
  await expect(statusGlyph).toBeVisible();
  await statusGlyph.getByRole('img').hover();
  await expect(page.getByRole('tooltip', {
    name: 'Click to reveal source line in specification and hierarchy',
  })).toBeVisible();
  await statusGlyph.click();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('11');

  await accountGlyph.focus();
  await page.keyboard.press('Enter');
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('1');
});

test('keeps a multi-declaration file implicit after a generated glyph click', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=codegena-playground--comprehensive&viewMode=story',
  );

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const fileRow = page.locator('[data-node-id="first-level.ts"]');

  await fileRow.click();
  await expect(fileRow).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', {
    name: 'Reveal FirstLevel in source schema at line 773',
  }).click();
  await expect(fileRow).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graphView = page.locator('.react-flow');
  const file = graphView.locator('[data-id="first-level.ts"]');
  const declaration = graphView.locator('[data-id="first-level.ts::FirstLevel"]');

  await expect(page.locator('.Playground__source .line-numbers.active-line-number'))
    .toHaveText('773');
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(file).toHaveClass(/(?:^|\s)implicitly-selected(?:\s|$)/);
  await expect(file).not.toHaveClass(/(?:^|\s)selected(?:\s|$)/);

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page.locator('[data-node-id="first-level.ts"]'))
    .toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Graph', exact: true }).click();
  await expect(file).toHaveClass(/(?:^|\s)implicitly-selected(?:\s|$)/);
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const unrelatedFile = page.locator('[data-node-id="simple-dynamic-ref.ts"]');

  await unrelatedFile.click({ modifiers: ['Shift'] });
  await page.getByRole('button', { name: 'Graph', exact: true }).click();
  await expect(file).toHaveClass(/(?:^|\s)implicitly-selected(?:\s|$)/);
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(graphView.locator('[data-id="simple-dynamic-ref.ts"]'))
    .toHaveClass(/(?:^|\s)selected(?:\s|$)/);

  await declaration.click();
  await expect(file).toHaveClass(/(?:^|\s)implicitly-selected(?:\s|$)/);
  await expect(graphView.locator('[data-id="simple-dynamic-ref.ts"]'))
    .not.toHaveClass(/(?:^|\s)selected(?:\s|$)/);

  await declaration.click();
  await expect(file).not.toHaveClass(/(?:^|\s)(?:implicitly-)?selected(?:\s|$)/);
  await expect(declaration).not.toHaveClass(/(?:^|\s)selected(?:\s|$)/);
});

test('keeps folding but omits TypeScript hints in generated code', async ({ page }) => {
  await page.goto(`${detailsStory}one-file&viewMode=story`);

  const generatedEditor = page.locator('.GeneratedFileDetails__root .monaco-editor');
  const declaration = generatedEditor.locator('.view-line')
    .filter({ hasText: 'export interface Account' });

  const tokens = declaration.locator('[class*="mtk"]');

  await expect.poll(() => (
    tokens.evaluateAll((elements) => {
      const colors = new Set(elements.map((element) => (
        getComputedStyle(element).color
      )));

      return colors.size;
    })
  ), { timeout: 15_000 }).toBeGreaterThan(1);
  await declaration.hover();
  await expect(page.locator('.monaco-hover')).toBeHidden();
  await expect(generatedEditor.locator('.squiggly-error')).toHaveCount(0);
  await expect(generatedEditor.locator('.inlay-hint')).toHaveCount(0);

  const foldingControl = generatedEditor.locator('.codicon-folding-expanded').last();

  await foldingControl.click();
  await expect(generatedEditor.locator('.view-line').filter({ hasText: 'id: string' }))
    .toHaveCount(0);

  await generatedEditor.click({ button: 'right' });

  const menu = page.getByRole('menu', { name: 'Code editor actions' });

  await expect(menu.getByRole('menuitem', { name: 'Copy' })).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveCount(1);
});

async function observeDetailsScrollBehavior(page: Page): Promise<void> {
  await page.locator('.GeneratedFileDetails__root').evaluate((element) => {
    const originalScrollTo = element.scrollTo.bind(element);

    Object.defineProperty(element, 'scrollTo', {
      configurable: true,
      value: (options: ScrollToOptions): void => {
        const previous = element.dataset['scrollBehaviors'];
        const behavior = options.behavior ?? 'auto';

        element.dataset['scrollBehaviors'] = previous
          ? `${previous},${behavior}`
          : behavior;
        originalScrollTo(options);
      },
    });
  });
}

test('uses smooth scrolling only for short generated-file lists', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await observeDetailsScrollBehavior(page);
  await page.getByRole('treeitem', { name: /status\.ts/ }).click();

  await expect(page.locator('.GeneratedFileDetails__root')).toHaveAttribute(
    'data-scroll-behaviors',
    /smooth/,
  );

  await page.goto('/iframe.html?id=codegena-playground--comprehensive&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await observeDetailsScrollBehavior(page);
  await page.getByRole('treeitem', { name: /zero-level\.ts/ }).click();

  await expect(page.locator('.GeneratedFileDetails__root')).toHaveAttribute(
    'data-scroll-behaviors',
    /instant/,
  );
});

test('reveals a file with a half-rem inset from the details viewport', async ({
  page,
}) => {
  await page.addInitScript(() => {
    document.documentElement.style.fontSize = '20px';
  });

  await page.goto(
    '/iframe.html?id=codegena-playground--comprehensive&viewMode=story',
  );

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.getByRole('treeitem', { name: /first-level\.ts/ }).click();

  const details = page.locator('.GeneratedFileDetails__root');
  const fileRow = details.locator('[data-details-row="file"]').filter({
    has: page.getByRole('group', {
      name: 'Details header for first-level.ts',
    }),
  });

  await expect(fileRow).toBeInViewport();
  await expect.poll(async () => fileRow.evaluate((element) => {
    const viewport = element.closest('.GeneratedFileDetails__root');

    if (!viewport) {
      return false;
    }

    const topInset = element.getBoundingClientRect().top
      - viewport.getBoundingClientRect().top;
    const rootFontSize = getComputedStyle(document.documentElement)
      .fontSize.replace('px', '');
    const halfRem = Number(rootFontSize) / 2;

    return Math.abs(topInset - halfRem) < 2;
  })).toBe(true);
});

test('shows the empty selected scope and offers all files', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--comprehensive&viewMode=story');

  await page.getByRole('button', { name: 'Show details' }).click();

  await expect(page.getByRole('button', { name: 'Show selected' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText(/Select generated files or\/and data types/)).toBeVisible();

  await page.getByRole('button', { name: 'see all files' }).click();

  await expect(page.getByRole('button', { name: 'Show all' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  const generatedEditor = page.locator(
    '.GeneratedFileDetails__root .monaco-editor',
  ).first();

  await expect(generatedEditor).toBeVisible();
});

test('emphasizes selected file cards only in Show all', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const accountCard = page.locator('.GeneratedFileDetailsFile__root').filter({
    has: page.getByRole('group', { name: 'Details header for account.ts' }),
  });

  const statusCard = page.locator('.GeneratedFileDetailsFile__root').filter({
    has: page.getByRole('group', { name: 'Details header for status.ts' }),
  });

  const accountHeader = accountCard.getByRole('group', {
    name: 'Details header for account.ts',
  });
  const statusHeader = statusCard.getByRole('group', {
    name: 'Details header for status.ts',
  });

  await page.locator('[data-node-id="account.ts"]').click();

  await expect(accountCard).toHaveClass(/GeneratedFileDetailsFile__selected/);
  await expect(accountCard).toHaveCSS('outline-style', 'solid');
  await expect(statusCard).not.toHaveClass(/GeneratedFileDetailsFile__selected/);

  const neutralHeaderBackground = await statusHeader.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  const neutralHeaderText = await statusHeader.evaluate(
    (element) => getComputedStyle(element).color,
  );

  await expect(accountHeader).toHaveCSS(
    'background-color',
    neutralHeaderBackground,
  );
  await expect(accountHeader).toHaveCSS('color', neutralHeaderText);

  await page.locator('[data-node-id="status.ts"]').click();
  await page.locator('[data-node-id="status.ts::Status"]').click();

  await expect(statusCard).toHaveClass(/GeneratedFileDetailsFile__selected/);
  await expect(accountCard).not.toHaveClass(/GeneratedFileDetailsFile__selected/);

  await page.getByRole('button', { name: 'Show selected' }).click();

  await expect(statusCard).not.toHaveClass(/GeneratedFileDetailsFile__selected/);
});

test('reveals a file without a blue highlight after scrolling', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=codegena-playground--comprehensive-with-persistence&viewMode=story',
  );

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const sortByFilename = page.getByRole('button', { name: 'By filename' });

  await expect(sortByFilename).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const details = page.locator('.GeneratedFileDetails__root');

  const tree = page.getByRole('tree', { name: 'Generated files' });

  await tree.getByRole('treeitem', { name: /first-level\.ts/ }).click();

  const fileRow = details.locator('[data-details-row="file"]').filter({
    has: page.getByRole('group', {
      name: 'Details header for first-level.ts',
    }),
  });

  await expect(fileRow).toBeInViewport();
  await expect(fileRow.locator(':scope > .RevealHighlight--active'))
    .toHaveCount(0);

  const revealedScrollTop = await details.evaluate((element) => element.scrollTop);

  await details.evaluate((element) => {
    element.scrollTop += element.clientHeight * 3;
  });

  await expect(fileRow).not.toBeInViewport();

  await details.evaluate((element, top) => {
    element.scrollTop = top;
  }, revealedScrollTop);

  await expect(fileRow).toBeInViewport();
  await expect(fileRow.locator(':scope > .RevealHighlight--active'))
    .toHaveCount(0);
});

test('copies the complete generated file from its header', async ({ page }) => {
  await stubClipboardWrites(page);
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', { name: 'Copy account.ts' }).click();

  await expect.poll(() => readClipboardWrites(page)).toEqual([
    expectedAccountFileText,
  ]);
  await expect(page.getByText('account.ts copied', { exact: true })).toBeVisible();
});

test('downloads the complete generated file from its header', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download account.ts' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe('account.ts');
  expect(await readFile(await download.path(), 'utf8'))
    .toBe(expectedAccountFileText);
});

test('offers a complete ZIP after a minimum pending period', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.locator('[data-node-id="account.ts"]').click();

  await expect(page.getByRole('button', { name: 'Show selected' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  const downloadAll = page.getByRole('button', { name: 'Download all files' });
  const startedAt = Date.now();

  await downloadAll.click();

  await expect(downloadAll).toBeDisabled();
  await expect(downloadAll).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByText('Archive is ready. You can download it.')).toBeVisible();
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(2900);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download zip-file' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe('account.schema.zip');

  const archive = unzipSync(await readFile(await download.path()));

  expect(Object.keys(archive).toSorted()).toEqual(['account.ts', 'status.ts']);
  expect(strFromU8(archive['account.ts'])).toContain('export interface Account');
  expect(strFromU8(archive['status.ts'])).toBe(
    'export type Status = \'active\' | \'disabled\';',
  );
});

test('downloads the cached ZIP immediately on a later click', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.locator('[data-node-id="account.ts"]').click();

  const downloadAll = page.getByRole('button', { name: 'Download all files' });

  await downloadAll.click();
  await expect(page.getByRole('button', { name: 'Download zip-file' })).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss notification' }).click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadAll.click(),
  ]);

  expect(download.suggestedFilename()).toBe('account.schema.zip');
  await expect(downloadAll).toBeEnabled();
  await expect(downloadAll).toHaveAttribute('aria-busy', 'false');
});

test('reports an archive preparation failure', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.locator('[data-node-id="account.ts"]').click();

  await page.evaluate(() => {
    FileReader.prototype.readAsDataURL = () => {
      throw new Error('Test ZIP read failure');
    };
  });

  const downloadAll = page.getByRole('button', { name: 'Download all files' });

  await downloadAll.click();

  await expect(page.getByText('Could not create the ZIP archive.')).toBeVisible();
  await expect(downloadAll).toBeEnabled();
});

test('initializes each virtualized generated file with TypeScript syntax', async (
  { page },
) => {
  test.setTimeout(120_000);

  const documentLoads: string[] = [];

  page.on('domcontentloaded', () => documentLoads.push(page.url()));

  await page.goto('/iframe.html?id=codegena-playground--comprehensive&viewMode=story');
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const fileDetails = page.getByRole('region', {
    name: 'Generated file details',
    exact: true,
  });
  const visitedFiles = new Map<number, { fileName: string; modelUri: string }>();

  await withUpdatedStorybookOutput(async () => {
    await visitGeneratedFileRows(fileDetails, async (rows) => {
      await expect.poll(async () => rows.evaluateAll((items) => items.flatMap((item) => {
        const headerName = item.querySelector('[role="group"]')
          ?.getAttribute('aria-label');
        const fileName = headerName?.replace(/^Details header for /, '');
        const editor = item.querySelector<HTMLElement>('.monaco-editor');
        const input = editor?.querySelector('[role="textbox"]');
        const modelUri = editor?.dataset['uri'];
        const language = item.querySelector<HTMLElement>('[data-mode-id]')
          ?.dataset['modeId'];
        const expectedName = `Generated code editor for ${fileName}`;
        const hasExpectedName = !!fileName
          && input?.getAttribute('aria-label') === expectedName;
        const renderedCode = editor?.querySelector('.view-lines')?.textContent?.trim();
        const hasRenderedCode = Boolean(renderedCode);

        if (hasExpectedName && modelUri && language === 'typescript' && hasRenderedCode) {
          return [];
        }

        return [{
          fileName,
          hasExpectedName,
          hasRenderedCode,
          language,
          modelUri,
        }];
      }))).toEqual([]);

      const mountedFiles = await rows.evaluateAll((items) => items.map((item) => ({
        fileName: item.querySelector('[role="group"]')
          ?.getAttribute('aria-label')
          ?.replace(/^Details header for /, '') ?? '',
        index: Number(item.dataset['index']),
        modelUri: item.querySelector<HTMLElement>('.monaco-editor')?.dataset['uri'] ?? '',
      })));

      mountedFiles.forEach(({ fileName, index, modelUri }) => {
        expect(visitedFiles.get(index)?.fileName ?? fileName).toBe(fileName);
        visitedFiles.set(index, { fileName, modelUri });
      });
    });
  });

  const fileNames = [...visitedFiles.values()].map(({ fileName }) => fileName);
  const modelUris = [...visitedFiles.values()].map(({ modelUri }) => modelUri);

  const uniqueFileNames = new Set(fileNames);
  const uniqueModelUris = new Set(modelUris);

  expect(uniqueFileNames.size).toBe(visitedFiles.size);
  expect(uniqueModelUris.size).toBe(visitedFiles.size);
  expect(documentLoads).toEqual([page.url()]);
});

test('restores the virtual file position after remounting', async ({ page }) => {
  await page.goto(
    `${detailsStory}snapshot-restoration&viewMode=story`,
  );

  const details = page.locator('.GeneratedFileDetails__root');

  await details.evaluate((element) => element.scrollTo({ top: 5000 }));
  await expect.poll(() => details.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(4000);

  const previousOffset = await details.evaluate((element) => element.scrollTop);

  await page.getByRole('button', { name: 'Unmount file list' }).click();
  await page.getByRole('button', { name: 'Restore file list' }).click();

  await expect.poll(async () => details.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(previousOffset - 100);
});

test('keeps the visible file anchored when a file is prepended', async ({ page }) => {
  await page.goto(
    `${detailsStory}changing-files&viewMode=story`,
  );

  const details = page.locator('.GeneratedFileDetails__root');

  await details.evaluate((element) => element.scrollTo({ top: 5000 }));

  const visibleFile = async (): Promise<string | null> => details.evaluate((element) => {
    const viewportTop = element.getBoundingClientRect().top;
    const rows = element.querySelectorAll<HTMLElement>('[data-details-row="file"]');
    const row = [...rows].find((item) => (
      item.getBoundingClientRect().bottom > viewportTop
    ));

    const headerName = row?.querySelector('[role="group"]')
      ?.getAttribute('aria-label');

    return headerName?.replace(/^Details header for /, '') ?? null;
  });

  await expect.poll(visibleFile).not.toBeNull();

  const anchoredFileName = await visibleFile();

  await page.getByRole('button', { name: 'Prepend file' }).click();

  await expect.poll(visibleFile).toBe(anchoredFileName);
});

test('follows a streamed file when already at the end', async ({ page }) => {
  await page.goto(
    `${detailsStory}streaming-at-end&viewMode=story`,
  );

  const details = page.locator('.GeneratedFileDetails__root');

  await details.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
  await page.getByRole('button', { name: 'Stream file' }).click();

  await expect(details.getByRole('group', {
    name: 'Details header for zzz-streamed-0.ts',
  })).toBeVisible();
});
