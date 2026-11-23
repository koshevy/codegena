import assert from 'node:assert/strict';

import { expect, test } from './fixtures';

test('renders React components and switches tabs inside an MDX article', async ({
  page,
}) => {
  await page.goto('/');

  const callout = page.getByRole('alert').filter({
    hasText: 'Keep the specification as the source of truth.',
  });

  await expect(callout).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Install', exact: true }))
    .toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Generate', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('npx oas3ts convert');
  await page.getByRole('tab', { name: 'Install', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('npm install');
});

test('keeps the shared editor, branding, and footer in the selected theme', async ({
  page,
}) => {
  const externalEditorRequests: string[] = [];

  page.on('request', (request) => {
    const url = new URL(request.url());
    const isEditorCdn = /cdn|unpkg|jsdelivr/.test(url.hostname);

    if (isEditorCdn) {
      externalEditorRequests.push(request.url());
    }
  });

  await page.goto('/core-features');

  const editor = page.getByRole('region', { name: 'typescript code example' });

  await expect(editor).toBeVisible();
  await expect(editor.locator('[data-token="keyword"]').first()).toBeVisible();
  await expect(editor.locator('.monaco-editor')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Main', exact: true })
    .getByRole('link', { name: 'Codegena home' })).toBeVisible();
  await expect(page.getByRole('contentinfo', { name: 'Site footer' })).toBeVisible();

  const navigation = page.getByRole('navigation', { name: 'Main', exact: true });
  const themeToggle = navigation.getByRole('button', { name: /^Theme:/ });

  await themeToggle.click();
  await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await themeToggle.click();
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(editor.locator('[data-token="keyword"]').first()).toBeVisible();
  expect(externalEditorRequests).toEqual([]);
});

test('navigates between partitions from the shared footer', async ({ page }) => {
  await page.goto('/');

  const footer = page.getByRole('contentinfo', { name: 'Site footer' });

  await footer.getByRole('link', { name: 'Extend', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Extend', level: 1 })).toBeVisible();
  await footer.getByRole('link', { name: 'Security', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Security', level: 1 })).toBeVisible();
});

test('keeps the narrow navigation menu visible below its header', async ({
  page,
}) => {
  const viewport = page.viewportSize();

  assert(viewport, 'This journey requires a configured browser viewport.');

  await page.setViewportSize({ ...viewport, width: Math.min(viewport.width, 900) });
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Main', exact: true });
  const toggle = navigation.getByRole('button', { name: 'Toggle navigation bar' });

  await toggle.click();

  const coreFeatures = navigation.getByRole('link', {
    name: 'Core features',
    exact: true,
  });

  await expect(coreFeatures).toBeInViewport();
  await coreFeatures.click();
  await expect(page.getByRole('heading', { name: 'Core features', level: 1 }))
    .toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
