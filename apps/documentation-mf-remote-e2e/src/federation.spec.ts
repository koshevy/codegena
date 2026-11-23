import { expect, test } from './fixtures';

test('mounts the exposed App and uses browser URLs for article navigation', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:8114');
  await expect(page.getByRole('heading', {
    name: 'Get started',
    level: 1,
  })).toBeVisible();

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });

  await footer.getByRole('link', { name: 'Core features', exact: true }).click();
  await expect(page.getByRole('heading', {
    name: 'Core features',
    level: 1,
  })).toBeVisible();
  await expect(page).toHaveURL('http://127.0.0.1:8114/core-features');

  await page.reload();
  await expect(page.getByRole('heading', {
    name: 'Core features',
    level: 1,
  })).toBeVisible();
});
