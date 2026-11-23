import { expect, test } from '@playwright/test';

test('shows generated files after converting a source schema', async ({
  page,
}) => {
  const sourceLoaded = page.waitForResponse((response) => {
    const url = new URL(response.url());

    return url.pathname === '/fixtures/account.schema.jsonc' && response.ok();
  });

  await page.goto(
    '/iframe.html?id=codegena-playground--account-converted-in-worker'
    + '&viewMode=story',
  );
  await sourceLoaded;

  await expect(page.getByRole('button', {
    name: 'Search in files and directories',
  })).toBeVisible();
  await expect(page.getByRole('button', {
    name: 'Hide source schema',
  })).toBeVisible();
  await expect(page.getByRole('group', {
    name: 'account.ts generated file',
  })).toBeVisible();
  await expect(page.getByRole('status', {
    name: 'Specification is converting',
  })).toBeHidden();
});
