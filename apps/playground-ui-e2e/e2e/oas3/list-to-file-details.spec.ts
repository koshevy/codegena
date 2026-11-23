import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  expectGeneratedLine,
  expectSourceLine,
  getFileCard,
  watchBrowserMessages,
} from './file-details-navigation';

const storyUrl = '/iframe.html?id=codegena-playground--'
  + 'one-password-connect-with-persistence&viewMode=story';

test.use({ viewport: { height: 1117, width: 1728 } });

async function openList(page: Page): Promise<Locator> {
  await page.goto(storyUrl);

  const listMode = page.getByRole('button', { name: 'List', exact: true });

  if (await listMode.getAttribute('aria-pressed') !== 'true') {
    await listMode.click();
  }

  const tree = page.getByRole('tree', { name: 'Generated files' });

  await expect(tree).toBeVisible();

  return tree;
}

async function showSourceAndAllDetails(page: Page): Promise<void> {
  const showSource = page.getByRole('button', { name: 'Show source schema' });

  if (await showSource.isVisible()) {
    await showSource.click();
  }

  const showDetails = page.getByRole('button', { name: 'Show details' });

  if (await showDetails.isVisible()) {
    await showDetails.click();
  }

  const showAll = page.getByRole('button', { name: 'Show all' });

  if (await showAll.getAttribute('aria-pressed') !== 'true') {
    await showAll.click();
  }
}

test('expands list directories independently of their selection', async ({
  page,
}) => {
  const tree = await openList(page);
  const activity = tree.locator('[data-node-id="activity"]');
  const activityIndex = tree.locator('[data-node-id="activity/index.ts"]');
  const items = tree.locator('[data-node-id="items"]');
  const common = tree.locator('[data-node-id="items/_common"]');

  await tree.getByRole('button', { name: 'Expand ./activity' }).click();
  await expect(activityIndex).toBeVisible();
  await expect(activity).not.toHaveAttribute('aria-checked', 'true');

  await tree.getByRole('button', { name: 'Collapse ./activity' }).click();
  await expect(activityIndex).toHaveCount(0);
  await expect(activity).not.toHaveAttribute('aria-checked', 'true');

  await tree.getByRole('button', { name: 'Expand ./items' }).click();
  await expect(common).toBeVisible();
  await expect(items).not.toHaveAttribute('aria-checked', 'true');

  await tree.getByRole('button', { name: 'Collapse ./items' }).click();
  await expect(common).toHaveCount(0);

  await items.getByText('items', { exact: true }).click();
  await expect(items).toHaveAttribute('aria-checked', 'true');
  await expect(common).toBeVisible();
});

test('list files and declarations navigate both code panels', async ({
  page,
}) => {
  const browserMessages = watchBrowserMessages(page);
  const tree = await openList(page);

  await showSourceAndAllDetails(page);

  const rootFile = tree.locator('[data-node-id="index.ts"]');

  await test.step('root namespace declaration', async () => {
    await rootFile.getByText('index.ts', { exact: true }).click();

    const declaration = tree.locator(
      '[data-node-id="index.ts::Api1PasswordConnect"]',
    );

    await expect(declaration).toBeVisible();
    await declaration.click();
    await expect(declaration).toHaveAttribute('aria-checked', 'true');

    const card = getFileCard(page, 'index.ts');

    await expect(card).toBeInViewport();
    await expect(card).toHaveClass(/GeneratedFileDetailsFile__selected/);
    await expectGeneratedLine(card, 20, 'namespace Api1PasswordConnect');
    await expectSourceLine(page, 1, '{');
  });

  await test.step('Activity operation file', async () => {
    await tree.getByRole('button', { name: 'Expand ./activity' }).click();

    const activityFile = tree.locator('[data-node-id="activity/index.ts"]');

    await activityFile.getByText('index.ts', { exact: true }).click();
    await expect(activityFile).toHaveAttribute('aria-checked', 'true');

    const card = getFileCard(page, 'activity/index.ts');

    await expect(card).toBeInViewport();
    await expect(card).toHaveClass(/GeneratedFileDetailsFile__selected/);
    await expectGeneratedLine(card, 1, 'export type');
    await expectSourceLine(page, 47, '"get": {');
  });

  await test.step('root document file', async () => {
    await rootFile.getByText('index.ts', { exact: true }).click();
    await expect(rootFile).toHaveAttribute('aria-checked', 'true');

    const card = getFileCard(page, 'index.ts');

    await expect(card).toBeInViewport();
    await expectGeneratedLine(card, 1, 'import');
    await expectSourceLine(page, 1, '{');
  });

  await test.step('API request interface', async () => {
    const requestFile = tree.locator(
      '[data-node-id="activity/api-request.ts"]',
    );

    await requestFile.getByText('api-request.ts', { exact: true }).click();

    const declaration = tree.locator(
      '[data-node-id="activity/api-request.ts::ApiRequest"]',
    );

    await expect(declaration).toBeVisible();
    await declaration.click();
    await expect(declaration).toHaveAttribute('aria-checked', 'true');

    const card = getFileCard(page, 'activity/api-request.ts');

    await expect(card).toBeInViewport();
    await expect(card).toHaveClass(/GeneratedFileDetailsFile__selected/);
    await expectGeneratedLine(card, 5, 'interface ApiRequest');
    await expectSourceLine(page, 1775, '"APIRequest"');
  });

  expect(browserMessages).toEqual([]);
});

test('selecting a nested list directory reveals its direct files', async ({
  page,
}) => {
  const browserMessages = watchBrowserMessages(page);
  const tree = await openList(page);

  await showSourceAndAllDetails(page);
  await tree.getByRole('button', { name: 'Expand ./items' }).click();
  await tree.getByRole('button', { name: 'Expand ./items/_common' }).click();

  const common = tree.locator('[data-node-id="items/_common"]');

  await common.getByText('_common', { exact: true }).click();
  await expect(common).toHaveAttribute('aria-checked', 'true');
  await expect(common).toBeInViewport();

  const firstFile = getFileCard(page, 'items/_common/field.ts');
  const secondFile = getFileCard(page, 'items/_common/full-item.ts');
  const details = page.locator('.GeneratedFileDetails__root');

  await expect(firstFile).toBeInViewport();
  await expect(secondFile).toBeInViewport();
  await expect.poll(async () => {
    const [fileBounds, detailsBounds] = await Promise.all([
      firstFile.boundingBox(),
      details.boundingBox(),
    ]);

    if (!fileBounds || !detailsBounds) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.abs(fileBounds.y - detailsBounds.y);
  }).toBeLessThan(24);
  expect(browserMessages).toEqual([]);
});

test('list warning reveal hides shortcut after Show all', async ({ page }) => {
  const tree = await openList(page);

  await showSourceAndAllDetails(page);
  await tree.getByRole('button', { name: 'Expand index.ts' }).click();
  await tree.getByRole('button', {
    name: 'Reveal warnings for Api1PasswordConnect',
  }).click();

  const details = page.getByRole('region', {
    name: 'Generated file details',
  });
  const warning = details.getByRole('article', {
    name: 'Warning: oas3-onepassword-connect.json:1526:21',
  }).filter({ hasText: 'Property "maximum"' });
  const warningShortcut = page.getByRole('button', {
    name: 'Scroll to warnings in generated file details',
  });

  await expect(page.getByRole('button', { name: 'Show selected' }))
    .toHaveAttribute('aria-pressed', 'true');
  await expect(warning).toBeInViewport({ ratio: 0.6 });
  await expect(warningShortcut).toBeHidden();
});
