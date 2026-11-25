import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

test('names the repository link and explains it on keyboard focus', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-unified-ui-branding-github-link--repository'));

  const link = page.getByRole('link', { name: 'GitHub repository' });

  await expect(link).toHaveAttribute('href', 'https://github.com/koshevy/codegena');
  await expect(link).toHaveAttribute('target', '_blank');
  await page.keyboard.press('Tab');
  await expect(link).toBeFocused();
  await expect(page.getByRole('tooltip', { name: 'View repository on GitHub' }))
    .toBeVisible();
});
