import { expect, test } from '@playwright/test';

test('shows a severity card separately from the editor', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=codegena-unified-ui-feedback-severity-card--warning',
  );

  const warning = page.getByRole('article', {
    name: 'Warning at schema.jsonc:1526:21',
  });

  await expect(warning).toContainText('schema.jsonc:1526:21');
  await expect(warning).toContainText('The generated type uses a fallback');
});

test('uses the theme warning color for the card border', async ({ page }) => {
  const themeCases = [
    {
      color: 'rgb(201, 138, 16)',
      story: 'warning',
    },
    {
      color: 'rgb(229, 168, 50)',
      story: 'dark',
    },
  ];

  for (const { color, story } of themeCases) {
    await page.goto(
      `/iframe.html?id=codegena-unified-ui-feedback-severity-card--${story}`,
    );

    const warning = page.getByRole('article', {
      name: 'Warning at schema.jsonc:1526:21',
    });

    await expect(warning).toHaveCSS('border-left-color', color);
  }
});
