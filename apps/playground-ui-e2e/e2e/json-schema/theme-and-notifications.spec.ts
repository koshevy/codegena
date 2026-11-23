import { expect, test } from '@playwright/test';

import { stubClipboardWrites } from './clipboard';

test('Light and Dark stories keep their named appearance', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/iframe.html?id=codegena-playground--light&viewMode=story');

  const playground = page.locator('.Playground__root');

  await expect(playground).toHaveCSS('background-color', 'rgb(246, 247, 249)');

  await page.getByRole('button', { name: 'Appearance preferences' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  const registrationStarted = Promise.withResolvers<void>();
  const releaseRegistration = Promise.withResolvers<void>();

  await page.exposeFunction('waitForStoryWorker', () => {
    registrationStarted.resolve();

    return releaseRegistration.promise;
  });

  await page.addInitScript(() => {
    const { serviceWorker } = navigator;
    const register = serviceWorker.register.bind(serviceWorker);
    const waitForStoryWorker: unknown = Reflect.get(window, 'waitForStoryWorker');

    if (typeof waitForStoryWorker !== 'function') {
      return;
    }

    serviceWorker.register = async (script, options) => {
      await waitForStoryWorker();

      return register(script, options);
    };
  });

  try {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/iframe.html?id=codegena-playground--dark&viewMode=story');
    await registrationStarted.promise;

    await expect(playground).toHaveCSS('background-color', 'rgb(18, 21, 26)');

    await page.getByRole('button', { name: 'Appearance preferences' }).click();
    await expect(page.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    const searchInitialization = page.waitForResponse((response) => {
      const request = response.request();
      const isSearchResponse = response.url().endsWith('/api/graph-search')
        && response.fromServiceWorker();

      if (!isSearchResponse || request.method() !== 'POST') {
        return false;
      }

      const body: unknown = request.postDataJSON();

      return typeof body === 'object'
        && body !== null
        && 'action' in body
        && body.action === 'initialize';
    });

    releaseRegistration.resolve();

    const initializedSearch = await searchInitialization;

    expect(initializedSearch.status()).toBe(204);
  }
  finally {
    releaseRegistration.resolve();
  }
});

test('switches the playground from light to dark mode', async ({ page }) => {
  await page.goto('/iframe.html?id=codegena-playground--comprehensive&viewMode=story');

  const playground = page.locator('.Playground__root');
  const lightBackground = await playground.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  await page.getByRole('button', { name: 'Appearance preferences' }).click();

  await expect.poll(() => page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Appearance preferences"]',
    );

    const menu = document.querySelector<HTMLElement>('.MuiMenu-paper');

    if (!button || !menu) {
      return Number.POSITIVE_INFINITY;
    }

    const buttonRight = button.getBoundingClientRect().right;
    const menuRight = menu.getBoundingClientRect().right;

    return Math.abs(buttonRight - menuRight);
  })).toBeLessThan(4);

  await expect(page.getByRole('menuitemradio', { name: 'System' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.getByRole('menuitemradio', { name: 'Light' }).click();

  await page.getByRole('button', { name: 'Appearance preferences' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();

  await expect.poll(() => playground.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  )).not.toBe(lightBackground);

  await page.getByRole('button', { name: 'Appearance preferences' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test('themes visible and grouped notifications in dark mode', async ({ page }) => {
  await stubClipboardWrites(page);
  await page.goto(
    '/iframe.html?id=codegena-playground--comprehensive-with-notification-overflow'
    + '&viewMode=story',
  );

  await page.getByRole('button', { name: 'Appearance preferences' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', {
    name: 'Scroll to warnings in generated file details',
  }).click();

  await page.getByRole('article', { name: /^Warning:/ })
    .first()
    .click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Copy warning' }).click();
  await page.getByText('Warnings', { exact: true }).click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Copy all warnings' }).click();

  const visibleCard = page.locator('.NotificationCard__root').first();
  const group = page.locator('.NotificationGroupCard__root');

  await expect(visibleCard).toContainText('Warning copied');
  await expect(visibleCard).toHaveCSS('color', 'rgb(238, 241, 244)');
  await expect(group).toBeVisible();
  await expect(group.locator('.NotificationGroupCard__heading')).toHaveCSS(
    'background-color',
    'rgb(24, 28, 34)',
  );
  await expect(group.locator('.NotificationGroupCard__footer')).toHaveCSS(
    'background-color',
    'rgb(24, 28, 34)',
  );

  const showButton = group.getByRole('button', { name: 'Show', exact: true });

  await expect(showButton).toHaveCSS('color', 'rgb(106, 158, 224)');
  await showButton.click();

  await expect(group.getByText(/warnings copied/)).toBeVisible();
  await expect(group.locator('.NotificationCard__root')).toHaveCSS(
    'color',
    'rgb(238, 241, 244)',
  );

  await group.getByRole('button', { name: 'Hide', exact: true }).click();
  await expect(group.locator('.NotificationCard__root')).toHaveCount(0);

  await group.getByRole('button', { name: 'Dismiss grouped' }).click();
  await expect(group).toHaveCount(0);
});
