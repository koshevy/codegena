import { expect, type Locator, type Page } from '@playwright/test';

export function getFileCard(page: Page, fileName: string): Locator {
  return page.locator('.GeneratedFileDetailsFile__root').filter({
    has: page.getByText(fileName, { exact: true }),
  });
}

export async function expectGeneratedLine(
  card: Locator,
  line: number,
  declaration: string,
): Promise<void> {
  const editor = card.locator('.monaco-editor');

  await expect(editor.locator('.line-numbers.active-line-number'))
    .toHaveText(String(line));
  await expect(editor.locator('.view-line').filter({ hasText: declaration }).first())
    .toBeVisible();
}

export async function expectSourceLine(
  page: Page,
  line: number,
  text: string,
): Promise<void> {
  const editor = page.locator('.Playground__source .monaco-editor');

  await expect(editor.locator('.line-numbers.active-line-number'))
    .toHaveText(String(line));
  await expect(editor.locator('.view-line').filter({ hasText: text }).first())
    .toBeVisible();
}

export function watchBrowserMessages(page: Page): string[] {
  const messages: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      messages.push(message.text());
    }
  });
  page.on('pageerror', (error) => messages.push(error.message));

  return messages;
}
