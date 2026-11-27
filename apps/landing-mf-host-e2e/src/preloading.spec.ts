import { expect, test } from '../fixtures';
import { scrollLandingTo, scrollSecondScreenTo } from './landing-journey';

test('01.16 — reveal the welcome view before the feature bundle finishes', async ({
  page,
}) => {
  const download = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();
  const resumeFeatures = Promise.withResolvers<void>();

  await page.route('**/main*.js', async (route) => {
    download.resolve();
    await resume.promise;
    await route.continue();
  }, { times: 1 });

  await page.route('**/landing-features*.js', async (route) => {
    await resumeFeatures.promise;
    await route.continue();
  }, { times: 1 });

  const opening = page.goto('/?testingMode=true');
  const preloader = page.getByRole('status', { name: 'Loading Codegena' });
  const contentLoader = page.getByRole('progressbar', {
    name: 'Loading landing content',
  });
  const slowConnection = page.getByRole('status').filter({
    hasText: 'Your connection still seems slow.',
  });
  const welcome = page.getByRole('region', { name: 'Welcome' });
  const features = page.getByRole('region', { name: 'Landing feature sections' });
  const playground = welcome.getByRole('button', { name: 'Playground' });

  try {
    await download.promise;
    await expect(preloader).toBeInViewport();
    await expect(welcome).toHaveCount(0);
    resume.resolve();
    await expect(welcome).toBeVisible();
    await expect(preloader).toBeHidden();
    await expect(contentLoader).toBeInViewport();
    await expect(slowConnection).toBeHidden();
    await expect(features).toHaveCount(0);
    await expect(playground).toBeDisabled();
    await expect(slowConnection).toBeVisible();
    await expect(slowConnection).toBeInViewport();
    await expect(slowConnection).toHaveCSS('background-color', 'rgb(229, 168, 50)');
    await expect(slowConnection).toHaveCSS('color', 'rgb(13, 14, 16)');
    await expect(slowConnection).toHaveCSS('font-weight', '400');

    resumeFeatures.resolve();
    await expect(features).toBeAttached();
    await expect(page.getByRole('contentinfo')).toBeAttached();
    await expect(contentLoader).toBeHidden();
    await expect(slowConnection).toBeHidden();
    await expect(playground).toBeEnabled();
  }
  finally {
    resume.resolve();
    resumeFeatures.resolve();
    await opening;
  }
});

test('01.21 — Unified UI stays usable if Nebula cannot load', async ({
  context,
  page,
}) => {
  const nebulaChunk = /\/landing-nebula[^/]*\.js$/;

  await context.route(nebulaChunk, (route) => route.fulfill({ status: 503 }));

  await page.goto('/?testingMode=true');

  const sectionNebula = page.waitForResponse(nebulaChunk);

  await scrollSecondScreenTo(page, 15.5 / 17);

  const sectionResponse = await sectionNebula;

  expect(sectionResponse.status()).toBe(503);
  await page.getByRole('button', { name: 'Simplest pet store', exact: true }).click();

  const playground = page.getByRole('dialog', { name: 'Simplest pet store demo' });

  await expect(playground.getByRole('button', {
    name: 'Search in files and directories',
  })).toBeVisible();
});

test.describe('HTML startup', () => {
  test.use({ javaScriptEnabled: false });

  test('01.20 — preload assets and show a themed message during a slow startup', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });

    const fontDownload = page.waitForResponse('**/golos-text-latin-400-normal.woff2');

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const body = page.locator('body');
    const message = page.getByText('Your connection seems slow. Please be patient.');
    const resetPreload = page.locator('link[rel="preload"][as="style"]');
    const stylesheet = page.locator('link[rel="stylesheet"]');
    const fontPreload = page.locator('link[rel="preload"][as="font"]');

    await expect(message).toBeHidden();
    await expect(message).toHaveCSS('animation-delay', '1.5s');
    await expect(message).toHaveCSS('font-size', '24px');
    await expect(message.locator('br')).toHaveCount(1);
    await expect(body).toHaveCSS('background-color', 'rgb(246, 247, 249)');
    await expect(resetPreload).toHaveAttribute(
      'href',
      /^\/assets\/ui-theme\/reset\.[a-f\d]{16}\.css$/,
    );

    const resetHref = await resetPreload.getAttribute('href');

    await expect(stylesheet).toHaveAttribute('href', resetHref ?? '');
    await expect(fontPreload).toHaveAttribute(
      'href',
      '/assets/ui-theme/golos-text-latin-400-normal.woff2',
    );

    const fontResponse = await fontDownload;

    expect(fontResponse.ok()).toBe(true);

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(body).toHaveCSS('background-color', 'rgb(18, 21, 26)');
    await expect(message).toBeInViewport();
    await expect(message).toBeVisible();
  });
});

test('01.24 — exposes the web app manifest and its installation icons', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]'))
    .toHaveAttribute('href', '/manifest.webmanifest');

  const response = await request.get('/manifest.webmanifest');

  expect(response.ok()).toBe(true);

  const manifest: unknown = await response.json();

  expect(manifest).toMatchObject({
    display: 'standalone',
    icons: [
      { sizes: '192x192', src: '/assets/pwa/icon-192.png', type: 'image/png' },
      { sizes: '512x512', src: '/assets/pwa/icon-512.png', type: 'image/png' },
    ],
    name: 'Codegena',
    scope: '/',
  });
  expect(manifest).toHaveProperty('start_url', '/');

  const icons = await Promise.all([
    request.get('/assets/pwa/icon-192.png'),
    request.get('/assets/pwa/icon-512.png'),
  ]);

  expect(icons.map((icon) => icon.ok())).toEqual([true, true]);
  expect(icons.map((icon) => icon.headers()['content-type']))
    .toEqual(['image/png', 'image/png']);
});

test('01.17 — restore the Ideology link after its section loads', async ({ page }) => {
  const resume = Promise.withResolvers<void>();

  await page.route('**/landing-features*.js', async (route) => {
    await resume.promise;
    await route.continue();
  }, { times: 1 });

  const opening = page.goto('/?testingMode=true#ideology');
  const heading = page.getByRole('heading', { name: /complexity/i, level: 2 });

  try {
    await expect(page.getByRole('region', { name: 'Welcome' })).toBeVisible();
    await expect(heading).toHaveCount(0);
    resume.resolve();
    await expect(heading).toBeInViewport();
  }
  finally {
    resume.resolve();
    await opening;
  }
});

test('01.18 — restore a saved position after the feature bundle loads', async ({
  page,
}) => {
  const featureScrollTop = 3500;

  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, featureScrollTop);
  await page.goto('/docs');
  await expect(page.getByRole('heading', { name: 'Get started', level: 1 }))
    .toBeVisible();

  const resume = Promise.withResolvers<void>();

  await page.route('**/landing-features*.js', async (route) => {
    await resume.promise;
    await route.continue();
  }, { times: 1 });

  const opening = page.goto('/?testingMode=true');

  try {
    await expect(page.getByRole('region', { name: 'Welcome' })).toBeVisible();
    resume.resolve();
    await expect.poll(() => page.evaluate(() => window.scrollY))
      .toBe(featureScrollTop);
  }
  finally {
    resume.resolve();
    await opening;
  }
});

test('01.19 — render the welcome view within the 1 MB startup budget', {
  tag: '@production',
}, async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  const deliveries: { bytes: number; timestamp: number }[] = [];

  await session.send('Network.enable');
  await session.send('Performance.enable');
  session.on('Network.dataReceived', ({ dataLength, timestamp }) => {
    deliveries.push({ bytes: dataLength, timestamp });
  });

  await page.addInitScript(() => {
    const observer = new MutationObserver((records) => {
      const body = document.body;
      const didChangeBodyClass = records.some(({ target }) => target === body);

      if (didChangeBodyClass && !body.classList.contains('GlobalCSS__preloading')) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => performance.mark('landing-painted'));
        });
        observer.disconnect();
      }
    });

    observer.observe(document, { attributeFilter: ['class'], subtree: true });
  });

  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Welcome' })).toBeVisible();
  await expect(page.getByRole('banner', { name: 'Landing navigation' })).toBeVisible();
  await page.waitForFunction(() => (
    performance.getEntriesByName('landing-painted').length > 0
  ));

  const { metrics } = await session.send('Performance.getMetrics');
  const navigationStart = Number(metrics.find(({ name }) => (
    name === 'NavigationStart'
  ))?.value);

  expect(navigationStart).toBeGreaterThan(0);

  const paintOffset = await page.evaluate(() => {
    const [paint] = performance.getEntriesByName('landing-painted', 'mark');

    return paint.startTime / 1000;
  });
  const paintTimestamp = navigationStart + paintOffset;
  const startupBytes = deliveries.reduce((total, { bytes, timestamp }) => (
    timestamp <= paintTimestamp ? total + bytes : total
  ), 0);

  await session.detach();
  expect(startupBytes).toBeGreaterThan(0);
  expect(startupBytes).toBeLessThanOrEqual(1_000_000);
});
