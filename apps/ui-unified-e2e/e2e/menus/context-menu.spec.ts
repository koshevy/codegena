import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

test('shows headed menu actions and disabled choices', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-unified-ui-menus-context-menu--with-header'));

  await page.getByRole('button', { name: 'Open menu' }).click();

  const menu = page.getByRole('menu', { name: 'Example actions' });

  await expect(menu).toBeVisible();
  await expect(menu.getByText('Generated declarations')).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'Reveal details' })).toBeEnabled();
  await expect(menu.getByRole('menuitem', { name: 'Reveal warnings' })).toBeDisabled();

  await menu.getByRole('menuitem', { name: 'Reveal details' }).click();
  await expect(menu).toBeHidden();
});
