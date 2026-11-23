import { expect, test } from '@playwright/test';

const storyUrl = '/iframe.html?id=codegena-playground--'
  + 'git-hub-rest-api-with-persistence&viewMode=story';

test('shows editor and graph loading skeletons during the large conversion', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.addInitScript(() => {
    const observeLoading = (): void => {
      const source = document.querySelector('[aria-label="Source editor is loading"]');
      const graph = document.querySelector('[aria-label="Graph layout is loading"]');

      if (source) {
        document.documentElement.dataset['sawSourceSkeleton'] = 'true';
      }

      if (graph) {
        document.documentElement.dataset['sawGraphSkeleton'] = 'true';
      }
    };

    const observer = new MutationObserver(observeLoading);

    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  });

  await page.goto(storyUrl);
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });

  await expect(page.locator('html')).toHaveAttribute('data-saw-source-skeleton', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-saw-graph-skeleton', 'true');
  await expect(page.getByRole('status', { name: 'Source editor is loading' }))
    .toBeHidden();
  await expect(page.getByRole('status', { name: 'Graph layout is loading' }))
    .toBeHidden();
});

test('keeps the large file list scrollable and disables bulk expansion', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto(storyUrl);
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const header = page.getByRole('group', { name: 'Generated output header' });

  await header.click({ button: 'right' });

  await expect(page.getByRole('menuitem', { name: 'Expand all directories' }))
    .toBeDisabled();
  await expect(page.getByRole('menuitem', { name: 'Collapse all directories' }))
    .toBeDisabled();
  await expect(page.getByRole('menuitem', { name: 'Expand all files' }))
    .toBeDisabled();
  await expect(page.getByRole('menuitem', { name: 'Collapse all files' }))
    .toBeDisabled();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'By source file and line' }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });

  await expect(tree).toBeVisible();

  const firstFileBeforeScroll = await tree.getByRole('treeitem').first().innerText();

  await tree.hover();
  await page.mouse.wheel(0, 50_000);

  await expect.poll(async () => (
    tree.getByRole('treeitem').first().innerText()
  )).not.toBe(firstFileBeforeScroll);

  const scrolledFile = tree.getByRole('treeitem').nth(8);

  await scrolledFile.click();
  await expect(scrolledFile).toHaveAttribute('aria-selected', 'true');
});

test('expands a large-tree row with the keyboard without selecting it', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto(storyUrl);
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const firstRow = tree.getByRole('treeitem').first();
  const expandButton = firstRow.getByRole('button', { name: /^Expand / });

  await expect(firstRow).toHaveAttribute('aria-selected', 'false');
  await expandButton.focus();
  await expandButton.press('Enter');

  await expect(firstRow).toHaveAttribute('aria-expanded', 'true');
  await expect(firstRow).toHaveAttribute('aria-selected', 'false');
});

test('keeps a newly selected directory visible after scrolling the large tree', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto(storyUrl);
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const apps = tree.getByRole('treeitem', {
    name: /\.\/apps apps /,
  });

  await apps.click();
  await expect(apps).toHaveAttribute('aria-selected', 'true');

  await tree.hover();
  await page.mouse.wheel(0, 1_400);

  const codeScanning = tree.getByRole('treeitem', {
    name: /\.\/code-scanning code-scanning /,
  });

  await expect(codeScanning).toBeInViewport();
  await codeScanning.click();

  await expect(page.getByRole('button', {
    name: 'Select ./code-scanning/_common directory',
  })).toBeVisible();
  await expect(codeScanning).toHaveAttribute('aria-selected', 'true');
  await expect(codeScanning).toBeInViewport();
});
