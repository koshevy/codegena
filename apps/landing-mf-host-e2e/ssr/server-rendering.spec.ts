import { expect, type Locator, type Page, test } from '@playwright/test';

const homeUrl = '/?testingMode=true';
const welcomeHeading = /Code generation on steroids/;
const featureBundle = '**/landing-features*.js';

interface StartupBundleManifest {
  clientShellGroup: string;
  groups: Record<string, string[]>;
}

async function readStartupAssets(page: Page): Promise<{
  files: string[];
  resetStylesheet: string;
}> {
  const manifest: StartupBundleManifest = await page.evaluate(async () => {
    const response = await fetch('/bundle-warmup.json');

    return response.json();
  });
  const files = manifest.groups[manifest.clientShellGroup] ?? [];
  const resetStylesheet = files.find((file) => (
    /^\/assets\/ui-theme\/reset\.[a-f0-9]+\.css$/.test(file)
  ));

  if (!resetStylesheet) {
    throw new Error('The client shell group must include the hashed reset stylesheet.');
  }

  return { files, resetStylesheet };
}

test('uses client rendering on reload while the startup assets are cached', async ({
  context,
  page,
}) => {
  const firstLoad = await page.goto(homeUrl);

  expect(await firstLoad?.text()).toContain('data-server-rendered="true"');

  const { files: startupFiles, resetStylesheet } = await readStartupAssets(page);

  await expect.poll(() => page.evaluate(async (files) => {
    const assets = await Promise.all(files.map((file) => caches.match(file)));

    return assets.every(Boolean);
  }, startupFiles)).toBe(true);

  const downloadedStartupFiles: string[] = [];

  context.on('request', (request) => {
    const { pathname } = new URL(request.url());

    if (request.serviceWorker() && startupFiles.includes(pathname)) {
      downloadedStartupFiles.push(pathname);
    }
  });

  const warmReload = await page.reload({ waitUntil: 'commit' });
  const warmHtml = await warmReload?.text();

  expect(warmReload?.fromServiceWorker()).toBe(true);
  expect(warmHtml).toContain('<body>');
  expect(warmHtml).toContain('<div id="root"></div>');
  await expect(page.getByRole('status', { name: 'Loading Codegena' })).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: welcomeHeading }))
    .toBeVisible();

  const editor = page.getByRole('region', {
    name: 'Generated code editor for inline-object-composition-patterns.ts',
  });
  const examples = page.getByRole('region', { name: 'Generated TypeScript examples' });

  await expect(examples).toContainText('InlineObjectCompositionPatterns');
  await expect(editor).toBeAttached();
  await expect(editor).toContainText('InlineObjectCompositionPatterns');
  expect(downloadedStartupFiles).toEqual([]);

  await page.evaluate(async (url) => {
    const names = await caches.keys();
    const stores = await Promise.all(names.map((name) => caches.open(name)));

    await Promise.all(stores.map((cache) => cache.delete(url)));
  }, resetStylesheet);

  const reloadWithMissingStylesheet = await page.reload();

  expect(await reloadWithMissingStylesheet?.text())
    .toContain('data-server-rendered="true"');
});

async function revealLandingNavigation(page: Page, isMobile: boolean): Promise<Locator> {
  if (isMobile) {
    await page.getByRole('button', { name: 'Open navigation menu' }).click();

    return page.getByRole('navigation', { name: 'Navigation drawer' });
  }

  return page.getByRole('banner', { name: 'Landing navigation' });
}

test.describe('Server markup', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the whole landing page without JavaScript', async ({ page }) => {
    await page.goto(homeUrl);

    const heading = page.getByRole('heading', { level: 1, name: welcomeHeading });
    const footer = page.getByRole('contentinfo', { name: 'Site footer' });

    await expect(heading).toBeVisible();
    await expect(heading.locator('..')).toHaveCSS('opacity', '1');
    await expect(footer.getByRole('link', { name: 'Docs', exact: true }))
      .toHaveAttribute('href', '/docs');

    const features = page.getByRole('region', { name: 'Landing feature sections' });

    await expect(features.getByRole('heading', { level: 2 })).toHaveText([
      /Most detailed\s*JSON Schema support/,
      /One CLI for\s*humans and AI/,
      /Files organised\s*by domain/,
      /Graph index by\s*our own design/,
      /Work in\s*your IDE/,
      /Try the playground\s*right here/,
    ]);
    await expect(features.getByText('inline-object-composition-patterns.ts'))
      .toBeVisible();

    const storyBounds = await features.evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      bottom: element.getBoundingClientRect().bottom,
      firstStageWidth: element.firstElementChild?.firstElementChild
        ?.getBoundingClientRect().width,
      lastChapterBottom: element.lastElementChild?.getBoundingClientRect().bottom,
    }));

    expect(storyBounds.firstStageWidth).toBe(storyBounds.width);
    expect(storyBounds.lastChapterBottom).toBeCloseTo(storyBounds.bottom, 0);

    const petStore = features.getByRole('link', { name: 'Simplest pet store' });

    await expect(petStore).toBeVisible();
    await expect(petStore).toHaveAttribute(
      'href',
      '/playground/%2Fspecifications%2Fpet-store.json?testingMode=true',
    );
    await expect(page.getByRole('heading', { name: 'Complexity management' }))
      .toBeVisible();
    await expect(footer).toBeVisible();
  });
});

test('enables the mobile navigation button after hydration', {
  tag: '@mobile-peel',
}, async ({ page }) => {
  const bootstrapRequested = Promise.withResolvers<void>();
  const releaseBootstrap = Promise.withResolvers<void>();

  await page.route('**/landing-bootstrap.*.js', async (route) => {
    bootstrapRequested.resolve();
    await releaseBootstrap.promise;
    await route.continue();
  });

  const menuButton = page.getByRole('button', { name: 'Open navigation menu' });
  const overlay = page.getByRole('region', { name: 'Navigation overlay' });

  try {
    await page.goto(homeUrl, { waitUntil: 'commit' });
    await bootstrapRequested.promise;
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toBeDisabled();
  }
  finally {
    releaseBootstrap.resolve();
  }

  await menuButton.click();
  await overlay.getByRole('link', { name: 'Personal data privacy', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Personal data privacy', level: 1 }))
    .toBeVisible();
});

test('hydrates the landing heading and opens the federated docs', async ({
  isMobile,
  page,
}) => {
  const scriptRequested = Promise.withResolvers<void>();
  const releaseScript = Promise.withResolvers<void>();
  const featuresRequested = Promise.withResolvers<void>();
  const releaseFeatures = Promise.withResolvers<void>();
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('codegena:landing:theme', 'light'));
  await page.route(/\/main\.[a-f0-9]+\.js$/, async (route) => {
    scriptRequested.resolve();
    await releaseScript.promise;
    await route.continue();
  });
  await page.route(featureBundle, async (route) => {
    featuresRequested.resolve();
    await releaseFeatures.promise;
    await route.continue();
  });

  try {
    await page.goto(homeUrl, { waitUntil: 'commit' });
    await scriptRequested.promise;

    const heading = page.getByRole('heading', { level: 1, name: welcomeHeading });
    const serverHeading = await heading.evaluateHandle((element) => element);
    const ideology = page.getByRole('heading', { name: 'Complexity management' });
    const serverIdeology = await ideology.evaluateHandle((element) => element);
    const features = page.getByRole('region', { name: 'Landing feature sections' });
    const serverStoryHeight = await features.evaluate((element) => (
      element.getBoundingClientRect().height
    ));

    await expect(page.getByRole('button', { name: 'Theme: Dark' })).toBeVisible();
    releaseScript.resolve();

    await expect(page.getByRole('button', { name: 'Theme: Light' })).toBeVisible();
    expect(await serverHeading.evaluate((element) => element.isConnected)).toBe(true);

    await featuresRequested.promise;
    await expect(page.getByRole('heading', { name: /Try the playground/ }))
      .toBeVisible();
    await expect(page.getByRole('contentinfo', { name: 'Site footer' })).toBeVisible();
    expect(await serverIdeology.evaluate((element) => element.isConnected)).toBe(true);
    releaseFeatures.resolve();

    const illustration = page.getByRole('group', { name: 'Feature illustration' });

    await expect(illustration).toBeAttached();

    const liveStoryHeight = await features.evaluate((element) => (
      element.getBoundingClientRect().height
    ));

    expect(liveStoryHeight).toBe(serverStoryHeight);

    const navigation = await revealLandingNavigation(page, isMobile);

    await navigation.getByRole('link', { name: 'Docs', exact: true }).click();

    const articleHeading = page.getByRole('heading', { level: 1, name: 'Get started' });

    await expect(articleHeading).toBeVisible();
    await page.reload();
    await expect(articleHeading).toBeVisible();
    expect(errors).toEqual([]);
  }
  finally {
    releaseScript.resolve();
    releaseFeatures.resolve();
  }
});

test('keeps the server-rendered page when the feature bundle fails', async ({
  isMobile,
  page,
}) => {
  await page.route(featureBundle, (route) => route.fulfill({ status: 503 }), {
    times: 1,
  });

  const failure = page.waitForResponse(featureBundle);

  await page.goto(homeUrl);

  const response = await failure;
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);

  expect(response.status()).toBe(503);

  await expect(page.getByRole('progressbar', { name: 'Loading landing content' }))
    .toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: welcomeHeading }))
    .toBeVisible();
  await expect(page.getByRole('link', { name: 'Simplest pet store' })).toBeVisible();

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });
  const navigation = await revealLandingNavigation(page, isMobile);

  await expect(footer.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
  await navigation.getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Get started' }))
    .toBeVisible();

  await footer.getByRole('link', { name: 'Codegena home' }).click();
  await expect(page.getByRole('group', { name: 'Feature illustration' })).toBeAttached();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
});

test('opens the federated Playground from a direct request', async ({ page }) => {
  await page.goto('/playground?testingMode=true');
  await expect(page).toHaveURL(
    /\/playground\/%2Fspecifications%2Fone-password\.json\?testingMode=true$/i,
  );
  await expect(page.getByRole('main', { name: 'Specification playground' }))
    .toBeVisible();
  await expect(page.getByRole('heading', { name: 'Declaration Api1PasswordConnect' }))
    .toBeVisible();
});
