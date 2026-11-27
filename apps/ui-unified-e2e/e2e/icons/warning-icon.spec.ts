import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

test('explains the warning action with a themed tooltip', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-unified-ui-icons-warning-icon-button--light'));

  await page.getByRole('button', { name: 'Reveal warnings' }).hover();
  await expect(page.getByRole('tooltip', {
    name: 'Has warnings (click to reveal)',
  })).toBeVisible();
});
