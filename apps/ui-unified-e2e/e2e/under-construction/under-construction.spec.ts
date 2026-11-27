import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`acknowledges the ${theme} construction notice for the session`, async ({
    page,
  }) => {
    await page.goto(getStoryUrl(`codegena-unified-ui-under-construction--${theme}`));

    const notice = page.getByRole('alertdialog', { name: 'Site under construction' });
    const acknowledge = notice.getByRole('button', { name: 'Got it' });

    await expect(notice.getByText(/Site under construction until/)).toBeVisible();
    await expect(notice).toBeVisible();
    await expect(acknowledge).toBeFocused();
    await acknowledge.press('Enter');
    await expect(notice).toBeHidden();
    await expect(page.getByRole('button', { name: 'Continue reading' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Continue reading' })).toBeVisible();
    await expect(notice).toBeHidden();
  });
}
