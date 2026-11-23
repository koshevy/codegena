import { expect, test } from '@playwright/test';

test('reveals a symbol from an editable editor glyph', async ({ page }) => {
  const inlineCompletionRequests: string[] = [];

  page.on('request', (request) => {
    const { pathname } = new URL(request.url());

    if (pathname.endsWith('/inlineCompletions.contribution.js')) {
      inlineCompletionRequests.push(pathname);
    }
  });

  await page.goto(
    '/iframe.html?id=codegena-unified-ui-monaco-editor-glyph--editable',
  );

  const glyph = page.getByRole('button', { name: 'Reveal Interface on line 2' });

  await expect(glyph).toBeVisible();
  await glyph.click();
  await expect(page.getByRole('status')).toHaveText('Symbol on line 2 revealed');
  expect(inlineCompletionRequests).toEqual([]);
});

test('reveals a symbol from a generated editor glyph', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=codegena-unified-ui-monaco-editor-glyph--generated',
  );

  const glyph = page.getByRole('button', { name: 'Reveal Interface on line 2' });

  await expect(glyph).toBeVisible();
  await glyph.click();
  await expect(page.getByRole('status')).toHaveText('Symbol on line 2 revealed');
});
