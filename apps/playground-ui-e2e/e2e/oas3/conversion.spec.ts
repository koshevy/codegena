import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

test('opens the GitHub REST API after conversion', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto(getStoryUrl('codegena-playground--git-hub-rest-api-with-persistence'));

  const conversionStatus = page.getByRole('status', {
    name: 'Specification is converting',
  });

  await expect(conversionStatus).toBeVisible();
  await expect(conversionStatus).toBeHidden({ timeout: 90_000 });
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible();
});
