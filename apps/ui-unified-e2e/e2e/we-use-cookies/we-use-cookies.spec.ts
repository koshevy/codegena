import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

const storyIdPrefix = 'codegena-unified-ui-we-use-cookies--';

for (const { action, choice } of [
  { action: 'Accept all', choice: 'acceptAll' },
  { action: 'Disable analytics', choice: 'disableAnalytics' },
]) {
  test(`saves ${action} and updates the choice in the same tab`, async ({ page }) => {
    await page.goto(getStoryUrl(`${storyIdPrefix}notice`));

    const notice = page.getByRole('region', { name: 'Cookies and privacy' });
    const saved = page.getByRole('status', { name: 'Saved cookie choice' });

    await expect(saved).toHaveText('No decision');
    await expect(notice.getByRole('link', { name: 'I don\'t trust at all' }))
      .toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    await notice.getByRole('button', { name: action, exact: true }).click();
    await expect(notice).toBeHidden();
    await expect(saved).toHaveText(choice);

    await page.reload();
    await expect(saved).toHaveText(choice);
    await expect(notice).toBeHidden();
  });
}

test('follows the configured exit link without recording consent', async ({ page }) => {
  await page.goto(getStoryUrl(`${storyIdPrefix}custom-exit`));

  const notice = page.getByRole('region', { name: 'Cookies and privacy' });

  await notice.getByRole('link', { name: 'I don\'t trust at all' }).click();
  await expect(page).toHaveURL(/#leave$/);
  await expect(page.getByRole('status', { name: 'Saved cookie choice' }))
    .toHaveText('No decision');
  await expect(notice).toBeVisible();
});

test('honors the current choice if storage cannot be written', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('codegena:cookie-consent', 'invalid');

    Object.defineProperty(Storage.prototype, 'setItem', {
      configurable: true,
      value: (): void => {
        throw new DOMException('Storage is full', 'QuotaExceededError');
      },
    });
  });
  await page.goto(getStoryUrl(`${storyIdPrefix}notice`));

  const notice = page.getByRole('region', { name: 'Cookies and privacy' });
  const saved = page.getByRole('status', { name: 'Saved cookie choice' });

  await expect(notice).toBeVisible();
  await expect(saved).toHaveText('No decision');
  await notice.getByRole('button', { name: 'Disable analytics' }).click();
  await expect(saved).toHaveText('disableAnalytics');
  await expect(notice).toBeHidden();
});

for (const example of ['notice', 'dark']) {
  test(`shows cookie button hover and pressed states in ${example}`, async ({ page }) => {
    await page.goto(getStoryUrl(`${storyIdPrefix}${example}`));

    const notice = page.getByRole('region', { name: 'Cookies and privacy' });
    const filled = notice.getByRole('button', { name: 'Accept all' });
    const outlined = notice.getByRole('link', { name: 'I don\'t trust at all' });

    for (const button of [filled, outlined]) {
      await expect(button).toHaveCSS('text-transform', 'uppercase');

      const restingOpacity = await button.evaluate(
        (element) => getComputedStyle(element, '::before').opacity,
      );

      await button.hover();
      await expect.poll(() => button.evaluate(
        (element) => getComputedStyle(element, '::before').opacity,
      )).not.toBe(restingOpacity);

      await page.mouse.down();
      await expect(button).not.toHaveCSS('transform', 'none');
      await page.mouse.move(0, 0);
      await page.mouse.up();
      await expect(button).toHaveCSS('transform', 'none');
    }

    await expect(page.getByRole('status', { name: 'Saved cookie choice' }))
      .toHaveText('No decision');
  });
}
