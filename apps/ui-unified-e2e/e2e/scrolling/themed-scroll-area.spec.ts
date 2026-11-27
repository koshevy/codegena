import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

test('scrolls overflowing content in the themed area', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-unified-ui-scrolling-themed-scroll-area--light'));

  const area = page.getByRole('region', { name: 'Example scroll area' });

  await expect(area).toBeVisible();

  const hasHorizontalOverflow = await area.evaluate((element) => (
    element.scrollWidth > element.clientWidth
  ));
  const hasVerticalOverflow = await area.evaluate((element) => (
    element.scrollHeight > element.clientHeight
  ));

  expect(hasHorizontalOverflow).toBe(true);
  expect(hasVerticalOverflow).toBe(true);

  await area.hover();
  await page.mouse.wheel(0, 180);
  await expect.poll(async () => area.evaluate((element) => (
    element.scrollTop
  ))).toBeGreaterThan(0);
});
