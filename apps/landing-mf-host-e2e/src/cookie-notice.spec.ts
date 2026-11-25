import { expect, test } from '../fixtures';
import { observeLandingDiagnostics, scrollLandingTo } from './landing-journey';

const documentationPages = [
  { path: '/docs', title: 'Get started' },
  { path: '/docs/roadmap-and-status', title: 'Roadmap and status' },
  { path: '/docs/core-features', title: 'Core features' },
  { path: '/docs/extend', title: 'Extend' },
  { path: '/docs/contribute', title: 'Contribute' },
  { path: '/docs/security', title: 'Security' },
  { path: '/docs/personal-data-privacy', title: 'Personal data privacy' },
  { path: '/docs/faq', title: 'FAQ' },
  { path: '/docs/about', title: 'About' },
  { path: '/docs/contacts', title: 'Contacts' },
  { path: '/docs/blog', title: 'Blog' },
  { path: '/docs/blog/archive', title: 'Archive' },
  { path: '/docs/blog/authors', title: 'Authors' },
  { path: '/docs/blog/documentation-foundation', title: 'Documentation foundation' },
];

test.use({ storageState: { cookies: [], origins: [] } });

test('01.25 — decline analytics on the first visit and reload', async ({ page }) => {
  const releaseFeatures = Promise.withResolvers<void>();

  await page.route('**/landing-features*.js', async (route) => {
    await releaseFeatures.promise;
    await route.continue();
  }, { times: 1 });

  await page.goto('/?testingMode=true', { waitUntil: 'domcontentloaded' });

  const notice = page.getByRole('region', { name: 'Cookies and privacy' });

  try {
    await expect(notice).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Landing feature sections' }))
      .toHaveCount(0);
    await expect(notice.getByRole('link', { name: 'Privacy policy' }))
      .toHaveAttribute('href', '/docs/personal-data-privacy');

    const repository = notice.getByRole('link', { name: 'repository' });

    await expect(repository)
      .toHaveAttribute('href', 'https://github.com/koshevy/codegena');
    await expect(repository).toHaveAttribute('target', '_blank');

    await notice.getByRole('button', { name: 'Disable analytics' }).click();
    await expect(notice).toBeHidden();
  }
  finally {
    releaseFeatures.resolve();
  }

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(notice).toBeHidden();
});

test('01.26 — the navigation menu takes priority over the notice', async ({ page }) => {
  await page.goto('/?testingMode=true');

  const notice = page.getByRole('region', { name: 'Cookies and privacy' });

  await expect(notice).toBeVisible();
  await scrollLandingTo(page, 120);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Navigation drawer' })).toBeVisible();

  const acceptAll = notice.getByRole('button', { name: 'Accept all' });

  await acceptAll.focus();
  await expect(acceptAll).not.toBeFocused();

  await page.keyboard.press('Escape');
  await acceptAll.focus();
  await expect(acceptAll).toBeFocused();
});

for (const { path, title } of documentationPages) {
  test(`CONSENT-01 — shows the notice on ${path} before consent`, async ({ page }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);

    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true }))
      .toBeVisible();
    await expect(page.getByRole('region', { name: 'Cookies and privacy' })).toBeVisible();
    expectNoDiagnostics();
  });
}

test('CONSENT-02 — shows the notice in Playground before consent', async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/playground?testingMode=true');
  await expect(page.getByRole('main', { name: 'Specification playground' }))
    .toBeVisible();
  await expect(page.getByRole('region', { name: 'Cookies and privacy' })).toBeVisible();
  expectNoDiagnostics();
});

for (const action of ['Accept all', 'Disable analytics']) {
  test(`CONSENT-03 — remembers ${action} across the site`, async ({ page }) => {
    const expectNoDiagnostics = observeLandingDiagnostics(page);

    await page.goto('/docs');

    const notice = page.getByRole('region', { name: 'Cookies and privacy' });

    await expect(notice).toBeVisible();
    await notice.getByRole('button', { name: action, exact: true }).click();
    await expect(notice).toBeHidden();

    await page.getByRole('navigation', { name: 'Main', exact: true })
      .getByRole('link', { name: 'Codegena home' }).click();
    await expect(page.getByRole('region', { name: 'Welcome' })).toBeVisible();
    await expect(notice).toBeHidden();

    await page.goto('/playground?testingMode=true');
    await expect(page.getByRole('main', { name: 'Specification playground' }))
      .toBeVisible();
    await expect(notice).toBeHidden();

    await page.goto('/docs/personal-data-privacy');
    await expect(page.getByRole('heading', { level: 1, name: 'Personal data privacy' }))
      .toBeVisible();
    await expect(notice).toBeHidden();
    expectNoDiagnostics();
  });
}
