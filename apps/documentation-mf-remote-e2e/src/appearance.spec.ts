import { testWithBrowserDiagnostics as test } from '@codegena/util-e2e';
import { expect } from '@playwright/test';
import assert from 'node:assert/strict';

test('renders React components and switches tabs inside an MDX article', async ({
  page,
}) => {
  await page.goto('/');

  const callout = page.getByRole('alert').filter({
    hasText: 'Keep the specification as the source of truth.',
  });

  await expect(callout).toBeVisible();

  const tabs = page.getByRole('tablist', { name: 'CLI commands' });
  const install = tabs.getByRole('tab', { name: 'Install', exact: true });

  await expect(install).toHaveAttribute('aria-selected', 'true');
  await install.press('ArrowRight');
  await expect(page.getByRole('tabpanel')).toContainText('npx oas3ts convert');
  await install.click();
  await expect(page.getByRole('tabpanel')).toContainText('npm install');
});

test('formats shell and TSX snippets for reading', async ({ page }) => {
  await page.goto('/');

  const bash = page.getByRole('region', { name: 'bash code example', exact: true });
  const sh = page.getByRole('region', { name: 'sh code example', exact: true });
  const tsx = page.getByRole('region', { name: 'tsx code example', exact: true }).first();
  const inlineCommand = page.getByRole('main').getByRole('code')
    .filter({ hasText: /^convert$/ });

  const plainColor = await bash.evaluate((block) => getComputedStyle(block).color);

  await expect(bash.getByText('npm', { exact: true }))
    .not.toHaveCSS('color', plainColor);
  await expect(sh.getByText('npx', { exact: true }))
    .not.toHaveCSS('color', plainColor);
  await expect(tsx.getByText('DocsAlert', { exact: true }).nth(1))
    .not.toHaveCSS('color', plainColor);
  await expect(inlineCommand).toHaveCSS('border-top-left-radius', '5.6px');

  const editors = [bash, sh, tsx] as const;

  for (const snippet of editors) {
    await expect(snippet).toHaveCSS('padding', '16px');
    await expect(snippet.locator('[data-line]').first())
      .toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  }

  const lineNumberLabels = await Promise.all(editors.map(async (snippet) => (
    snippet.locator('[data-line]').first().evaluate((row) => (
      getComputedStyle(row, '::before').content
    ))
  )));

  expect(lineNumberLabels).toEqual(['""', '""', '"1" / ""']);
});

test('fills the transparent header after scrolling one rem', async ({ page }) => {
  await page.goto('/');

  const header = page.getByRole('navigation', { name: 'Main', exact: true });
  const transparent = 'rgba(0, 0, 0, 0)';

  const threshold = await page.locator('html').evaluate((root) => (
    Number(getComputedStyle(root).fontSize.replace('px', ''))
  ));

  await expect(header).toHaveCSS('background-color', transparent);
  await expect(header)
    .toHaveCSS('transition-property', 'background-color, border-bottom-color');
  await page.mouse.wheel(0, threshold - 1);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(threshold - 1);
  await expect(header).toHaveCSS('background-color', transparent);
  await page.mouse.wheel(0, 1);
  await expect(header).not.toHaveCSS('background-color', transparent);
  await page.mouse.wheel(0, -threshold);
  await expect(header).toHaveCSS('background-color', transparent);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(header).toHaveCSS('transition-duration', '0s');
});

test('aligns the header and article layout on a wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/');

  const header = page.getByRole('navigation', { name: 'Main', exact: true })
    .locator('.navbar__inner');
  const content = page.locator('.main-wrapper');
  const sidebar = page.getByRole('complementary').filter({
    has: page.getByRole('navigation', { name: 'Docs sidebar' }),
  });

  await expect(header).toHaveCSS('width', '1376px');
  await expect(content).toHaveCSS('width', '1376px');
  await expect(sidebar).toHaveCSS('border-right-width', '0px');

  const availableWidth = await page.locator('html').evaluate((root) => root.clientWidth);
  const centeredLeft = (availableWidth - 1376) / 2;

  const headerBounds = await header.boundingBox();
  const contentBounds = await content.boundingBox();

  expect(headerBounds?.x).toBe(centeredLeft);
  expect(contentBounds?.x).toBe(centeredLeft);
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
