import { expect, test as base } from '@playwright/test';

export const test = base.extend<{ consoleDiagnostics: void }>({
  consoleDiagnostics: [async ({ page }, use): Promise<void> => {
    const messages: string[] = [];

    page.on('pageerror', (error) => messages.push(error.message));
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        messages.push(message.text());
      }
    });

    await use();
    expect(messages).toEqual([]);
  }, { auto: true }],
});

export { expect };
