import { expect, test } from '@playwright/test';

['light', 'dark'].forEach((mode) => {
  test(`shows footer navigation and branding in ${mode} mode`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=codegena-unified-ui-branding-site-footer--${mode}&viewMode=story`,
    );

    const footer = page.getByRole('contentinfo', { name: 'Site footer' });

    await expect(footer.getByRole('img', { name: 'Codegena wordmark' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
    await expect(footer.getByRole('link', {
      name: 'Security',
      exact: true,
    })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'koshevy@gmail.com' })).toBeVisible();
  });
});
