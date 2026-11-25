import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

for (const mode of ['System', 'Light', 'Dark']) {
  test(`shows ${mode} as the selected appearance and restores keyboard focus`, async ({
    page,
  }) => {
    await page.goto(
      getStoryUrl(`codegena-unified-ui-menus-theme-mode-switcher--${mode.toLowerCase()}`),
    );

    const toggle = page.getByRole('button', { name: `Theme: ${mode}`, exact: true });

    await expect(toggle).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu', { name: 'Theme mode', exact: true }))
      .toBeVisible();
    await expect(page.getByRole('menuitemradio', { name: mode, exact: true }))
      .toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
}
