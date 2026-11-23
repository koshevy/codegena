import { expect, test } from '@playwright/test';

test('names the programming language on hover', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=codegena-unified-ui-icons-programming-language-icon--python',
  );

  await page.getByRole('img', { name: 'Python' }).hover();
  await expect(page.getByRole('tooltip', { name: 'Python' })).toBeVisible();
});
