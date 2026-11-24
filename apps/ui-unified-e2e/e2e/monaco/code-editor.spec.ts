import { expect, test } from '@playwright/test';

test('edits highlighted JSON without mounting or starting Monaco', async ({ page }) => {
  const workerUrls: string[] = [];
  const monacoRequests: string[] = [];

  page.on('worker', (worker) => workerUrls.push(worker.url()));
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());

    if (/\/(?:monaco-editor|monaco-workers)\//.test(pathname)) {
      monacoRequests.push(pathname);
    }
  });
  await page.goto('/iframe.html?id=codegena-unified-ui-monaco-code-editor--minimal');

  const editor = page.getByRole('textbox', { name: 'Example JSON editor' });

  await expect(page.getByText('"enabled"', { exact: true })).toBeVisible();
  await editor.focus();
  await editor.press('ArrowDown');
  await expect(page.locator('[data-line="2"]')).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('Control+a');
  await page.keyboard.type('42');

  const editedCode = page.locator('[data-token="number"]').filter({ hasText: /^42$/ });

  await expect(editedCode).toBeVisible();
  await editor.click({ button: 'right' });
  await expect(page.getByRole('menu', { name: 'Code editor actions' })).toHaveCount(0);
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  expect(workerUrls).toEqual([]);
  expect(monacoRequests).toEqual([]);
});

test('matches Monaco keyword color and typography in both themes', async ({ page }) => {
  const storyPrefix = '/iframe.html?id=codegena-unified-ui-monaco-code-editor--';
  const editor = page.getByRole('textbox', { name: 'Example JSON editor' });
  const fullKeyword = page.locator('.view-line').getByText('true', { exact: true });
  const minimalKeyword = page.getByText('true', { exact: true });
  const themes = [
    { full: 'editable-json', minimal: 'minimal' },
    { full: 'dark', minimal: 'minimal-dark' },
  ];

  for (const { full, minimal } of themes) {
    await page.goto(`${storyPrefix}${full}`);
    await expect(page.locator('[aria-busy="false"]')).toBeVisible();

    const keywordColor = await fullKeyword.evaluate((element) => (
      getComputedStyle(element).color
    ));

    await page.goto(`${storyPrefix}${minimal}`);
    await expect(editor).toHaveCSS('font-size', '13px');
    await expect(editor).toHaveCSS('font-weight', '400');
    // Chromium reports zero letter spacing as either 0px or normal.
    await expect(editor).toHaveCSS('letter-spacing', /^(?:0px|normal)$/);
    await expect(editor).toHaveCSS('line-height', '20px');
    await expect(editor).toHaveCSS('padding-top', '16px');
    await expect(minimalKeyword).toHaveCSS('color', keywordColor);
  }
});

test('formats JSON with the local language worker', async ({ page }) => {
  const workerUrls: string[] = [];

  page.on('worker', (worker) => workerUrls.push(worker.url()));

  await page.goto(
    '/iframe.html?id=codegena-unified-ui-monaco-code-editor--editable-json',
  );

  await expect(page.locator('[aria-busy="false"]')).toBeVisible();
  await page.getByRole('textbox', { name: 'Example JSON editor' }).focus();
  // Monaco follows Desktop Chrome's Windows user agent, not the host OS.
  await page.keyboard.press('Control+End');
  await page.keyboard.press('Home');
  await page.keyboard.press('Backspace');
  await expect(page.locator('.monaco-editor .view-line').last())
    .toHaveText(/true\}$/);
  await page.keyboard.press('Alt+Shift+F');

  await expect(page.locator('.monaco-editor .view-line')).toHaveText([
    /^\{$/,
    /"name":\s+"Codegena",/,
    /"enabled":\s+true/,
    /^\}$/,
  ]);
  expect(workerUrls).toContainEqual(expect.stringContaining('json.worker'));
});

test('mounts an accessible editable JSON editor', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=codegena-unified-ui-monaco-code-editor--editable-json'
    + '&viewMode=story',
  );

  const editor = page.getByRole('textbox', { name: 'Example JSON editor' });

  await editor.focus();
  await page.keyboard.type('{"valid": true}');
  await expect(page.getByText('"valid"', { exact: true })).toBeVisible();
});

test('keeps JSON pending until its syntax colors are ready', async ({ page }) => {
  const storyPrefix = '/iframe.html?id=codegena-unified-ui-monaco-'
    + 'code-editor--';

  await page.goto(`${storyPrefix}pending-syntax`);

  const pendingFrame = page.locator('[aria-busy="true"]');

  await expect(pendingFrame.getByRole('textbox', {
    name: 'Example JSON editor',
  })).toBeAttached();
  await expect(pendingFrame.locator('.view-line > span').first())
    .toHaveCSS('animation-name', 'codegena-code-text-shimmer');

  await page.goto(`${storyPrefix}editable-json`);

  const readyFrame = page.locator('[aria-busy="false"]');

  await expect(readyFrame.getByRole('textbox', {
    name: 'Example JSON editor',
  })).toBeAttached();
  await expect(readyFrame.locator(
    '.view-line span[class*="mtk"]:not(.mtk1)',
  ).first()).toBeVisible();
});
