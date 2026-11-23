import { expect, test } from '@playwright/test';

[
  { story: 'open', outline: '#8a5f00' },
  { story: 'dark-open', outline: '#c98a10' },
].forEach(({ story, outline }) => {
  test(`folder icon keeps a dark outline around its pale fill: ${story}`, async ({
    page,
  }) => {
    await page.goto([
      '/iframe.html?id=codegena-unified-ui-icons-folder-state-icon--',
      story,
      '&viewMode=story',
    ].join(''));

    const icon = page.locator('#storybook-root svg');

    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute('stroke', outline);
    await expect(icon).toHaveAttribute('fill', '#ffc966');
  });
});
