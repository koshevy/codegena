import { expect, test } from '../../fixtures';

import {
  expectEditorLine,
  expectGeneratedDeclaration,
  observeEmbeddedDiagnostics,
  onePasswordExample,
  openEmbeddedPlayground,
} from './index';

test.describe.configure({ timeout: 120_000 });

const activityRequestDeclaration = /\binterface\s+ApiRequest\b/;

test('02.06 — graph selections reveal source and generated code', async ({
  page,
}) => {
  const expectNoDiagnostics = await observeEmbeddedDiagnostics(page);
  const overlay = await openEmbeddedPlayground(page);

  await overlay.getByRole('button', { name: 'Graph', exact: true }).click();
  await overlay.getByRole('heading', {
    name: 'Declaration Api1PasswordConnect',
    exact: true,
  }).click();
  await expectGeneratedDeclaration(
    overlay,
    'index.ts',
    /\bnamespace\s+Api1PasswordConnect\b/,
  );
  await expectEditorLine(overlay, 'Source schema code editor', 1, '{');
  expectNoDiagnostics();

  await overlay.getByRole('button', { name: 'Expand ./activity directory' }).click();
  await overlay.getByRole('button', { name: 'Fit View' }).click();
  await overlay.getByRole('heading', { name: 'Declaration ApiRequest' }).click();
  await expectGeneratedDeclaration(
    overlay,
    'activity/api-request.ts',
    activityRequestDeclaration,
  );
  await expectEditorLine(overlay, 'Source schema code editor', 1775, '"APIRequest"');

  await overlay.getByRole('button', { name: 'Show all', exact: true }).click();
  await expect(overlay.getByRole('button', { name: 'Show all', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');
  await expectGeneratedDeclaration(
    overlay,
    'activity/api-request.ts',
    activityRequestDeclaration,
  );
  await overlay.getByRole('button', { name: 'Hide details', exact: true }).click();
  await expect(overlay.getByRole('region', { name: 'Generated file details' }))
    .toBeHidden();
  await overlay.getByRole('button', { name: 'Show details', exact: true }).click();
  await expectGeneratedDeclaration(
    overlay,
    'activity/api-request.ts',
    activityRequestDeclaration,
  );
  expectNoDiagnostics();
});

test('02.06 — tree navigation and warnings work inside Playground', async ({
  page,
}) => {
  const expectNoDiagnostics = await observeEmbeddedDiagnostics(page);
  const overlay = await openEmbeddedPlayground(page);

  await overlay.getByRole('button', { name: 'List', exact: true }).click();

  const tree = overlay.getByRole('tree', { name: 'Generated files' });

  await tree.getByRole('button', { name: 'Expand ./activity', exact: true }).click();
  await tree.getByRole('button', { name: 'Expand activity/api-request.ts' }).click();

  const declaration = tree.getByRole('treeitem', {
    name: /^Select ApiRequest declaration\b/,
  });

  await declaration.getByText('ApiRequest', { exact: true }).click();
  await expect(declaration).toHaveAttribute('aria-checked', 'true');
  await expectGeneratedDeclaration(
    overlay,
    'activity/api-request.ts',
    activityRequestDeclaration,
  );
  await expectEditorLine(overlay, 'Source schema code editor', 1775, '"APIRequest"');
  expectNoDiagnostics();

  await tree.getByRole('button', { name: 'Collapse ./activity', exact: true }).click();
  await expect(declaration).toBeHidden();
  await tree.getByRole('button', { name: 'Expand ./activity', exact: true }).click();
  await expect(declaration).toHaveAttribute('aria-checked', 'true');
  expectNoDiagnostics();

  await tree.getByRole('button', { name: 'Expand index.ts', exact: true }).click();
  await tree.getByRole('button', {
    name: 'Reveal warnings for Api1PasswordConnect',
    exact: true,
  }).click();

  const details = overlay.getByRole('region', { name: 'Generated file details' });
  const warning = details.getByRole('article', {
    name: 'Warning: one-password.json:1526:21',
  }).filter({ hasText: 'Property "maximum"' });

  await expect(warning).toBeInViewport();
  await expect(overlay.getByRole('button', {
    name: 'Scroll to warnings in generated file details',
  })).toBeHidden();
  expectNoDiagnostics();
  await warning.getByRole('button', { name: 'Show source', exact: true }).click();
  await expect(warning).toContainText('"length"');
  await warning.getByRole('button', { name: 'Hide source', exact: true }).click();
  await warning.getByRole('button', { name: 'Show source', exact: true }).click();
  await expect(warning).toContainText('"length"');

  const sourceInput = overlay.getByRole('textbox', {
    name: 'Source schema code editor',
    exact: true,
  });

  await sourceInput.focus();
  await sourceInput.press('F8');
  await expect(page.getByRole('link', { name: 'View in file details' })).toBeVisible();
  await sourceInput.press('Escape');
  await expect(overlay).toBeVisible();
  expectNoDiagnostics();
});

test('02.06 — search selection and closing do not leak into the next example', async ({
  page,
}) => {
  const expectNoDiagnostics = await observeEmbeddedDiagnostics(page);
  const overlay = await openEmbeddedPlayground(page);
  const playgroundUrl = page.url();

  await overlay.getByRole('button', { name: 'Appearance preferences' }).click();

  const appearance = page.getByRole('menu', { name: 'Theme mode' });

  await expect(appearance).toBeVisible();
  await appearance.press('Escape');
  await expect(appearance).toBeHidden();
  await expect(overlay).toBeVisible();

  await overlay.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox');

  await search.fill('ApiRequest');
  await page.getByRole('option', { name: /^ApiRequest\b/ }).click();
  await expect(search).toBeHidden();
  await expectGeneratedDeclaration(
    overlay,
    'activity/api-request.ts',
    activityRequestDeclaration,
  );
  await expectEditorLine(overlay, 'Source schema code editor', 1775, '"APIRequest"');
  await expect(page).toHaveURL(playgroundUrl);

  const sourceInput = overlay.getByRole('textbox', {
    name: 'Source schema code editor',
    exact: true,
  });

  await sourceInput.focus();
  // Both browser projects use non-macOS user agents and Monaco key bindings.
  await sourceInput.press('Control+Shift+O');

  const symbolPicker = page.getByRole('textbox', {
    name: 'Type to narrow down results.',
    exact: true,
  });

  await expect(symbolPicker).toBeVisible();
  await symbolPicker.press('Escape');
  await expect(overlay).toBeVisible();

  await overlay.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('link', { name: 'Return to landing', exact: true }).click();
  await expect(overlay).toHaveCount(0);
  await expect(page.getByRole('button', { name: onePasswordExample, exact: true }))
    .toBeVisible();
  await expect(page.getByRole('heading', { name: 'Select example:', exact: true }))
    .toHaveCSS('opacity', '1');

  const petstoreButton = page.getByRole('button', {
    name: 'Simplest pet store',
    exact: true,
  });

  await expect(petstoreButton).toBeInViewport({ ratio: 1 });
  await petstoreButton.click();

  const petstore = page.getByRole('dialog', { name: 'Simplest pet store demo' });

  await petstore.getByRole('button', {
    name: 'Search in files and directories',
  }).click();
  await search.fill('ApiRequest');
  await expect(page.getByText('No results found', { exact: true })).toBeVisible();
  await search.press('Escape');
  await expect(petstore).toBeVisible();
  await petstore.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('link', { name: 'Return to landing', exact: true }).click();
  await expect(petstore).toHaveCount(0);
  await expect(page).toHaveURL(/\/\?testingMode=true$/);
  expectNoDiagnostics();
});
