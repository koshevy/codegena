import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

['light', 'dark'].forEach((mode) => {
  test(`shows footer navigation and branding in ${mode} mode`, async ({ page }) => {
    await page.goto(getStoryUrl(`codegena-unified-ui-branding-site-footer--${mode}`));

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
