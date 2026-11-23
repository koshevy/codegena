import { expect, type Page, test } from '@playwright/test';

import {
  freezeSvgAnimation,
  observeLandingDiagnostics,
  scrollLandingTo,
  scrollSecondScreenTo,
  waitForWelcomeEntrance,
} from './landing-journey';

async function chooseTheme(page: Page, theme: string): Promise<void> {
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: theme, exact: true }).click();
  await expect(page.getByRole('button', { name: `Theme: ${theme}` })).toBeVisible();
}

test('01.08 — theme controls share a saved choice across both menus', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await expect(page.getByRole('button', { name: 'Theme: Dark' })).toBeVisible();

  const darkBackground = await page.locator('body').evaluate((body) => (
    getComputedStyle(body).backgroundColor
  ));

  await chooseTheme(page, 'Light');
  await expect(page.locator('body')).not.toHaveCSS('background-color', darkBackground);
  await page.reload();
  await waitForWelcomeEntrance(page);
  await freezeSvgAnimation(page.getByRole('img', { name: 'Codegena logo' }));
  await expect(page.getByRole('button', { name: 'Theme: Light' })).toBeVisible();
  await expect.soft(page).toHaveScreenshot('01-theme-light.png');

  await scrollLandingTo(page, 120);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();

  const themeChoices = page.getByRole('group', { name: 'Theme', exact: true });

  await expect(themeChoices).toBeVisible({ visible: !isMobile });
  await freezeSvgAnimation(page.getByRole('region', { name: 'Navigation overlay' })
    .getByRole('img', { name: 'Codegena wordmark' }));
  await expect.soft(page).toHaveScreenshot('01-theme-overlay-light.png');
  await page.keyboard.press('Escape');
  await scrollLandingTo(page, 0);
  await expect(page.getByRole('button', { name: 'Theme: Light' })).toBeVisible();

  const title = page.getByRole('heading', { name: 'Try the playground right here' });
  const titleEmphasis = title.getByText('right here', { exact: true });
  const primaryTextColor = await page.getByRole('main').evaluate((main) => (
    getComputedStyle(main).color
  ));

  await scrollSecondScreenTo(page, 15.01 / 17);
  await expect(title).toHaveCSS('color', primaryTextColor);
  await expect(titleEmphasis).toHaveCSS('color', primaryTextColor);

  await scrollSecondScreenTo(page, 15.75 / 17);
  await expect(title).toHaveCSS('color', /rgb\(255, 255, 25[45]\)/);
  await expect(titleEmphasis).toHaveCSS('color', /rgb\(255, 255, 25[45]\)/);
  await expect(page.getByRole('heading', { name: 'Select example:' }))
    .toHaveCSS('color', /rgb\(255, 255, 25[45]\)/);

  await scrollSecondScreenTo(page, 15.01 / 17);
  await expect(title).toHaveCSS('color', primaryTextColor);
  await expect(titleEmphasis).toHaveCSS('color', primaryTextColor);
  expectNoDiagnostics();
});

test('01.10 — selecting a theme closes the overlay menu @desktop-menu', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, 120);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();

  const themeChoices = page.getByRole('group', { name: 'Theme', exact: true });
  const heading = page.getByRole('heading', { name: 'Theme', exact: true });
  const navigationFontSize = await page.getByRole('navigation', {
    name: 'Navigation drawer',
  }).getByRole('link', { name: 'Docs', exact: true }).evaluate((link) => (
    getComputedStyle(link).fontSize
  ));

  await expect(heading).toHaveCSS('font-size', navigationFontSize);
  await expect(themeChoices.getByRole('button', { name: 'Dark', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');

  const navigation = page.getByRole('navigation', { name: 'Navigation drawer' });
  const menuToggle = page.getByRole('button', { name: 'Open navigation menu' });

  for (const theme of ['Light', 'System', 'Dark']) {
    await themeChoices.getByRole('button', { name: theme, exact: true }).focus();
    await page.keyboard.press('Space');
    await expect(navigation).toBeHidden();
    await expect(menuToggle).toBeFocused();
    await menuToggle.click();
    await expect(themeChoices.getByRole('button', { name: theme, exact: true }))
      .toHaveAttribute('aria-pressed', 'true');
  }

  await page.keyboard.press('Escape');
  await scrollLandingTo(page, 0);
  await expect(page.getByRole('button', { name: 'Theme: Dark' })).toBeVisible();
  expectNoDiagnostics();
});

test('01.09 — System follows the device while explicit themes stay selected', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/?testingMode=true');

  const themeButton = page.getByRole('button', { name: 'Theme: Dark' });

  await themeButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu', { name: 'Theme mode' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(themeButton).toBeFocused();
  await chooseTheme(page, 'System');

  const darkBackground = await page.locator('body').evaluate((body) => (
    getComputedStyle(body).backgroundColor
  ));

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('body')).not.toHaveCSS('background-color', darkBackground);
  await expect(page.getByRole('button', { name: 'Theme: System' })).toBeVisible();

  const lightBackground = await page.locator('body').evaluate((body) => (
    getComputedStyle(body).backgroundColor
  ));

  await chooseTheme(page, 'Dark');
  await expect(page.locator('body')).toHaveCSS('background-color', darkBackground);
  await chooseTheme(page, 'Light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('body')).toHaveCSS('background-color', lightBackground);
  expectNoDiagnostics();
});

test('01.11 — opening the theme menu keeps the page width stable', async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await waitForWelcomeEntrance(page);

  await page.evaluate(() => document.fonts.ready);

  const themeButton = page.getByRole('button', {
    includeHidden: true,
    name: 'Theme: Dark',
  });
  const before = await themeButton.boundingBox();

  await themeButton.click();
  await expect(page.getByRole('menu', { name: 'Theme mode' })).toBeVisible();
  await expect.poll(() => themeButton.boundingBox()).toEqual(before);
  expect(await page.evaluate(() => (
    window.innerWidth - document.documentElement.clientWidth
  ))).toBe(0);
  await page.keyboard.press('Escape');
  await expect(themeButton).toBeFocused();
  expectNoDiagnostics();
});

[
  { mode: 'Dark', textColor: 'rgb(83, 54, 101)' },
  { mode: 'Light', textColor: 'rgb(68, 34, 88)' },
].forEach(({ mode, textColor }) => {
  test(`02.06 — pale example panels retain dark text in ${mode} mode`, async ({
    page,
  }) => {
    await page.goto('/?testingMode=true');
    await chooseTheme(page, mode);
    await scrollSecondScreenTo(page, 15.75 / 17);

    const example = page.getByRole('button', { name: 'Simplest pet store' });
    const description = page.getByText(/Codegena can run entirely in the browser/);

    await expect(example).toBeVisible();
    await expect(example).toHaveCSS('color', textColor);
    await expect(description).toHaveCSS('color', textColor);
  });
});
