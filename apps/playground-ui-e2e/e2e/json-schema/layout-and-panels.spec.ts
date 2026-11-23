import { expect, test, type Locator } from '@playwright/test';

import { getGraphViewportZoom } from '../get-graph-viewport-zoom';

async function getBounds(locator: Locator): Promise<{
  height: number;
  width: number;
  x: number;
  y: number;
}> {
  const bounds = await locator.boundingBox();

  if (!bounds) {
    throw new Error('The element has no screen position.');
  }

  return bounds;
}

test('hides and restores the source and details columns', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--comprehensive&viewMode=story');

  await expect(page.getByText('Source schema', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Hide source schema' }).click();
  await expect(page.getByText('Source schema', { exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Show source schema' }).click();
  await expect(page.getByText('Source schema', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Show details' }).click();
  await expect(page.getByText('Generated file details', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Hide details' }).click();
  await expect(page.getByText('Generated file details', { exact: true })).toBeHidden();
});

test('restores theme mode and list sorting', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=codegena-playground--comprehensive-with-persistence&viewMode=story',
  );

  await page.getByRole('button', { name: 'Appearance preferences' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'System' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const sortByFilename = page.getByRole('button', { name: 'By filename' });
  const sortBySource = page.getByRole('button', { name: 'By source' });

  await expect(sortByFilename).toHaveAttribute('aria-pressed', 'true');
  await sortBySource.click();
  await expect(sortBySource).toHaveAttribute('aria-pressed', 'true');

  await page.reload();

  await expect(page.getByRole('button', { name: 'List', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(sortBySource).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Appearance preferences' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test('keeps graph content in place while the source column moves', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=codegena-playground--comprehensive&viewMode=story');

  const graph = page.locator('.react-flow');
  const viewport = graph.locator('.react-flow__viewport');
  const node = graph.locator('.react-flow__node[data-id="comprehensive-schema.ts"]');

  await expect(node).toBeVisible();

  const initialBounds = await getBounds(node);
  const initialX = initialBounds.x;
  const initialY = initialBounds.y;
  const initialZoom = await getGraphViewportZoom(viewport);

  const expectSameView = async (): Promise<void> => {
    await expect.poll(async () => {
      const bounds = await getBounds(node);

      return Math.hypot(bounds.x - initialX, bounds.y - initialY);
    }).toBeLessThan(2);
    await expect.poll(() => getGraphViewportZoom(viewport))
      .toBe(initialZoom);
  };

  await page.getByRole('button', { name: 'Hide source schema' }).click();
  await expect(page.getByText('Source schema', { exact: true })).toBeHidden();
  await expectSameView();

  await page.getByRole('button', { name: 'Show source schema' }).click();
  await expect(page.getByText('Source schema', { exact: true })).toBeVisible();
  await expectSameView();

  const separator = page.getByRole('separator', {
    name: 'Resize source and generated panels',
  });
  const separatorBounds = await getBounds(separator);

  const startX = separatorBounds.x + separatorBounds.width / 2;
  const pointerY = separatorBounds.y + separatorBounds.height / 2;

  await page.mouse.move(startX, pointerY);
  await page.mouse.down();
  await page.mouse.move(startX + 60, pointerY, { steps: 4 });
  await expectSameView();
  await page.mouse.move(startX + 120, pointerY, { steps: 4 });
  await page.mouse.up();

  await expect.poll(async () => {
    const bounds = await getBounds(separator);

    return bounds.x;
  }).toBeGreaterThan(separatorBounds.x + 60);
  await expectSameView();
});
