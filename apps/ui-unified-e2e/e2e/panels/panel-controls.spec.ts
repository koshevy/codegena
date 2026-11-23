import { expect, test } from '@playwright/test';

test('names panel actions for their visible state', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=codegena-unified-ui-panels-panel-toggle--show-source&viewMode=story',
  );
  await expect(page.getByRole('button', {
    name: 'Show source schema',
  })).toBeVisible();

  await page.goto(
    '/iframe.html?id=codegena-unified-ui-panels-panel-toggle--hide-details',
  );

  const hideDetails = page.getByRole('button', { name: 'Hide details' });

  await expect(hideDetails).toBeVisible();
});

test('keeps a titleless panel header accessible', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=codegena-unified-ui-panels-panel-header--generated-output'
    + '&viewMode=story',
  );

  const header = page.getByRole('group', { name: 'Generated output header' });

  await expect(header).toBeVisible();
  await expect(header.getByText('Generated output', { exact: true }))
    .toHaveCount(0);
  await expect(header.getByText('Import', { exact: true })).toBeVisible();
  await expect(header.getByRole('button', { name: 'Show details' }))
    .toBeVisible();
});
