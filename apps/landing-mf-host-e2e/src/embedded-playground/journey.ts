import { expect, type Locator, type Page } from '@playwright/test';

import {
  waitForPlaygroundIllustration,
  waitForWelcomeEntrance,
} from '../landing-journey';

export const onePasswordExample = '1Password small API set (67 declarations)';

export async function startEmbeddedPlayground(
  page: Page,
  label = onePasswordExample,
): Promise<Locator> {
  await page.goto('/?testingMode=true');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await waitForWelcomeEntrance(page);
  await page.getByRole('button', { name: 'Playground', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Select example:', exact: true }))
    .toBeInViewport();
  await waitForPlaygroundIllustration(page);
  await page.getByRole('button', { name: label, exact: true }).click();

  const overlay = page.getByRole('dialog', { name: `${label} demo` });

  return overlay;
}

export async function openEmbeddedPlayground(
  page: Page,
  label = onePasswordExample,
): Promise<Locator> {
  const overlay = await startEmbeddedPlayground(page, label);

  await expect(overlay.getByRole('button', {
    name: 'Search in files and directories',
  })).toBeVisible({ timeout: 90_000 });

  return overlay;
}

function getCodeEditor(overlay: Locator, name: string): Locator {
  return overlay.getByRole('code').filter({
    has: overlay.page().getByRole('textbox', { name, exact: true }),
  });
}

/**
 * Monaco exposes its editor name but not its active source line through ARIA.
 * Inspect only that internal detail inside the named code editor.
 */
export async function expectEditorLine(
  overlay: Locator,
  name: string,
  line: number,
  text: string,
): Promise<void> {
  const editor = getCodeEditor(overlay, name);

  await expect(editor.locator('.line-numbers.active-line-number'))
    .toHaveText(String(line));
  await expect(editor.locator('.view-line').filter({ hasText: text }).first())
    .toBeVisible();
}

export async function expectGeneratedDeclaration(
  overlay: Locator,
  fileName: string,
  declaration: RegExp,
): Promise<void> {
  const editor = getCodeEditor(overlay, `Generated code editor for ${fileName}`);
  const declarationLine = editor.locator('.view-line').filter({ hasText: declaration });
  const activeGutterRow = editor.locator('.margin-view-overlays > div').filter({
    has: overlay.page().locator('.line-numbers.active-line-number'),
  });

  await expect(declarationLine).toBeVisible();

  // Monaco renders the line and its gutter row at the same vertical offset.
  const declarationTop = await declarationLine.evaluate((line) => (
    getComputedStyle(line).top
  ));

  await expect(activeGutterRow).toHaveCSS('top', declarationTop);
}
