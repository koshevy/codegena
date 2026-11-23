import { expect, test as base } from '@playwright/test';
import assert from 'node:assert/strict';

export const test = base.extend<{ consoleDiagnostics: void }>({
  consoleDiagnostics: [async ({ page }, runWithDiagnostics): Promise<void> => {
    const messages: string[] = [];

    page.on('pageerror', (error) => messages.push(error.message));
    page.on('console', (message) => {
      const isDiagnostic = ['error', 'warning'].includes(message.type());

      if (isDiagnostic) {
        messages.push(message.text());
      }
    });

    await runWithDiagnostics();
    assert.deepEqual(messages, []);
  }, { auto: true }],
});

export { expect };
