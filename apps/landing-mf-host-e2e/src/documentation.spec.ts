import { expect, test } from '../fixtures';
import { openDocumentationNavigation } from './documentation-journey';
import { openEmbeddedPlayground } from './embedded-playground/journey';
import {
  observeLandingDiagnostics,
  scrollLandingTo,
  scrollSecondScreenTo,
  waitForPlaygroundIllustration,
} from './landing-journey';

test('DOCS-09 — documentation applies its layout styles on direct entry', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/docs');
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Get started',
    exact: true,
  })).toBeVisible();

  const navigation = page.getByRole('navigation', { name: 'Main', exact: true });

  await expect(navigation).toHaveCSS('padding-left', '16px');
  await expect(navigation).toHaveCSS('padding-right', '16px');
  await expect(page.getByRole('link', { name: 'Skip to main content', exact: true }))
    .not.toBeInViewport();
  expectNoDiagnostics();
});

test('DOCS-10 — keyboard article navigation restarts at the document', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/docs');

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });
  const coreFeatures = footer.getByRole('link', { name: 'Core features', exact: true });

  await coreFeatures.focus();
  await coreFeatures.press('Enter');
  await expect(page.getByRole('heading', { name: 'Core features', level: 1 }))
    .toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content', exact: true }))
    .toBeFocused();
  expectNoDiagnostics();
});

test('DOCS-11 — mobile menu consumes Back before navigation @mobile-peel', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/docs');

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });

  await footer.getByRole('link', { name: 'Core features', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/core-features$/);

  const toggle = page.getByRole('navigation', { name: 'Main', exact: true })
    .getByRole('button', { name: 'Toggle navigation bar' });

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.goBack();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/\/docs\/core-features$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/docs$/);
  await expect(page.getByRole('heading', { name: 'Get started', level: 1 }))
    .toBeVisible();
  expectNoDiagnostics();
});

test('DOCS-00 — the startup line stays visible during the docs download', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const download = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();

  await page.route('**/documentation-remote/remoteEntry.js*', async (route) => {
    download.resolve();
    await resume.promise;
    await route.continue();
  }, { times: 1 });

  const opening = page.goto('/docs');

  try {
    await download.promise;

    const preloader = page.getByRole('status', { name: 'Loading Codegena' });

    await expect(preloader).toBeInViewport();
    await expect(page.getByRole('region', { name: 'Landing feature sections' }))
      .toHaveCount(0);
    resume.resolve();
    await opening;
    await expect(page.getByRole('heading', {
      level: 1,
      name: 'Get started',
      exact: true,
    })).toBeVisible();
    await expect(preloader).toBeHidden();
    expectNoDiagnostics();
  }
  finally {
    resume.resolve();
    await opening;
  }
});

test('DOCS-01 — documentation deep links reload and preserve browser history', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const remoteRequests: string[] = [];

  page.on('request', (request) => {
    const requestUrl = new URL(request.url());

    remoteRequests.push(requestUrl.pathname);
  });

  await page.goto('/docs/core-features');
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Core features',
    exact: true,
  })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Landing feature sections' }))
    .toHaveCount(0);
  expect(remoteRequests).toContain('/documentation-remote/remoteEntry.js');

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });
  const extend = footer.getByRole('link', { name: 'Extend', exact: true });

  await expect(extend).toHaveAttribute('href', '/docs/extend');
  await extend.click();
  await expect(page).toHaveURL(/\/docs\/extend$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Extend', exact: true }))
    .toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/docs\/core-features$/);
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Core features',
    exact: true,
  })).toBeVisible();

  await page.goForward();
  await page.reload();
  await expect(page).toHaveURL(/\/docs\/extend$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Extend', exact: true }))
    .toBeVisible();
  expectNoDiagnostics();
});

test('DOCS-02 — the desktop header opens documentation @desktop-menu', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/?testingMode=true');

  const docs = page.getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Docs', exact: true });

  await expect(docs).toHaveAttribute('href', '/docs');

  const header = page.getByRole('banner', { name: 'Landing navigation' });
  const landingFrame = await header.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      background: style.backgroundColor,
      height: element.getBoundingClientRect().height,
      shadow: style.boxShadow,
    };
  });

  await docs.click();
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Get started',
    exact: true,
  })).toBeVisible();
  await expect(page).toHaveURL(/\/docs\/?$/);

  const documentationFrame = await page.getByRole('navigation', {
    name: 'Main',
    exact: true,
  }).evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      background: style.backgroundColor,
      height: element.getBoundingClientRect().height,
      shadow: style.boxShadow,
    };
  });

  expect(documentationFrame).toEqual(landingFrame);
  expectNoDiagnostics();
});

test('DOCS-03 — landing footer and overlay menu open documentation', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const remoteRequests: string[] = [];

  page.on('request', (request) => {
    const url = new URL(request.url());

    if (url.pathname === '/documentation-remote/remoteEntry.js') {
      remoteRequests.push(url.pathname);
    }
  });

  await page.goto('/?testingMode=true');

  const footerDocs = page.getByRole('navigation', { name: 'Footer navigation' })
    .getByRole('link', { name: 'Docs', exact: true });

  await footerDocs.scrollIntoViewIfNeeded();
  await expect(footerDocs).toHaveAttribute('href', '/docs');
  expect(remoteRequests).toEqual([]);
  await footerDocs.click();
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Get started',
    exact: true,
  })).toBeVisible();
  await expect(page).toHaveURL(/\/docs\/?$/);
  expect(remoteRequests).toEqual(['/documentation-remote/remoteEntry.js']);

  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, 800);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();

  const menuDocs = page.getByRole('navigation', { name: 'Navigation drawer' })
    .getByRole('link', { name: 'Docs', exact: true });

  await expect(menuDocs).toHaveAttribute('href', '/docs');
  await menuDocs.click();
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Get started',
    exact: true,
  })).toBeVisible();
  await expect(page).toHaveURL(/\/docs\/?$/);
  expectNoDiagnostics();
});

test('DOCS-04 — the embedded Playground menu opens the independent docs route', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);
  const playground = await openEmbeddedPlayground(page, 'Simplest pet store');

  await playground.getByRole('button', { name: 'Open navigation menu' }).click();

  const docs = page.getByRole('navigation', { name: 'Navigation drawer' })
    .getByRole('link', { name: 'Docs', exact: true });

  await expect(docs).toHaveAttribute('href', '/docs');
  await docs.click();
  await expect(page).toHaveURL(/\/docs\/?$/);
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Get started',
    exact: true,
  })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Simplest pet store demo' }))
    .toHaveCount(0);
  expectNoDiagnostics();
});

test('DOCS-05 — article navigation finishes its progress indicator', async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.clock.install();
  await page.goto('/docs/');

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });

  await footer.getByRole('link', { name: 'Core features', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Core features', level: 1 }))
    .toBeVisible();
  await page.clock.runFor(1000);

  // Docusaurus owns this non-interactive, document-level progress container.
  await expect(page.locator('#nprogress')).toHaveCount(0);
  expectNoDiagnostics();
});

test('DOCS-06 — documentation header links and selection follow the page', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/docs/');

  const navigation = page.getByRole('navigation', { name: 'Main', exact: true });

  await expect(navigation.getByRole('link', { name: 'Codegena home' }))
    .toHaveAttribute('href', '/');
  await expect(navigation.getByRole('link', { name: 'GitHub repository' }))
    .toBeVisible();
  await navigation.getByRole('button', { name: /^Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await openDocumentationNavigation(page, isMobile);

  const blog = navigation.getByRole('link', { name: 'Blog', exact: true }).first();

  await blog.click();
  await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();

  await openDocumentationNavigation(page, isMobile, false);

  const docs = navigation.getByRole('link', { name: 'Docs', exact: true }).first();

  await expect(docs).not.toHaveAttribute('aria-current', 'page');
  await expect(navigation.getByRole('link', { name: 'Blog', exact: true }).first())
    .toHaveAttribute('aria-current', 'page');
  expectNoDiagnostics();
});

test('DOCS-07 — documentation opens the standalone 1Password Playground', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/docs/?testingMode=true');

  const navigation = page.getByRole('navigation', { name: 'Main', exact: true });

  await openDocumentationNavigation(page, isMobile);

  const playgroundLink = navigation.getByRole('link', {
    name: 'Playground',
    exact: true,
  }).first();

  await expect(playgroundLink).toHaveAttribute('href', '/playground');
  await playgroundLink.click();
  await expect(page).toHaveURL(
    /\/playground\/%2Fspecifications%2Fone-password\.json\?testingMode=true$/i,
  );
  await expect(page.getByRole('main', { name: 'Specification playground' }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Search in files and directories' }))
    .toBeVisible({ timeout: 90_000 });
  await expect(page.getByRole('heading', { name: 'Declaration Api1PasswordConnect' }))
    .toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Search in files and directories' }))
    .toBeVisible({ timeout: 90_000 });
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('navigation', { name: 'Navigation drawer' })
    .getByRole('link', { name: 'Return to landing' }).click();
  await expect(page).toHaveURL(/\/\?testingMode=true$/);
  await expect(page.getByRole('region', { name: 'Welcome' })).toBeVisible();
  expectNoDiagnostics();
});

test('DOCS-08 — article history preserves the landing terminal styles', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();

  const sessionStart = await page.evaluate(() => performance.timeOrigin);

  await scrollSecondScreenTo(page, 7.96 / 17);
  await waitForPlaygroundIllustration(page);

  const greeting = page.getByRole('img', { name: 'Codegena CLI greeting' });

  await expect(greeting).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(greeting).toHaveCSS('padding', '0px');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('navigation', { name: 'Navigation drawer' })
    .getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Get started', level: 1 }))
    .toBeVisible();

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });

  await footer.getByRole('link', { name: 'Core features', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/core-features$/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Get started', level: 1 }))
    .toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/\?testingMode=true$/);
  await scrollSecondScreenTo(page, 7.96 / 17);
  await waitForPlaygroundIllustration(page);
  await expect(greeting).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(greeting).toHaveCSS('padding', '0px');
  await expect(greeting).toHaveCSS('border-radius', '0px');
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Get started', level: 1 }))
    .toBeVisible();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(sessionStart);
  expectNoDiagnostics();
});
