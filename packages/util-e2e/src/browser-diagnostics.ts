import { expect, type Page, test } from '@playwright/test';

/**
 * Records uncaught errors and console errors or warnings on the given page.
 */
export function collectBrowserDiagnostics(page: Page): readonly string[] {
  const messages: string[] = [];

  page.on('console', (message) => {
    const type = message.type();

    if (type !== 'error' && type !== 'warning') {
      return;
    }

    const { lineNumber, url } = message.location();
    const location = url ? ` (${url}:${lineNumber + 1})` : '';

    messages.push(`${type}: ${message.text()}${location}`);
  });

  page.on('pageerror', (error) => {
    messages.push(`page error: ${error.stack ?? error.message}`);
  });

  return messages;
}

/**
 * Fails each test if its Playwright page reports a browser diagnostic.
 */
export const testWithBrowserDiagnostics = test.extend<{ browserDiagnostics: void }>({
  browserDiagnostics: [async ({ page }, use): Promise<void> => {
    const messages = collectBrowserDiagnostics(page);

    await use();
    expect(messages).toEqual([]);
  }, { auto: true }],
});
