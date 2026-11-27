import type { Page } from '@playwright/test';

export async function stubClipboardWrites(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const clipboardState = window as typeof window & { clipboardWrites: string[] };

    clipboardState.clipboardWrites = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string): Promise<void> => {
          clipboardState.clipboardWrites.push(value);
        },
      },
    });
  });
}

export async function readClipboardWrites(page: Page): Promise<string[]> {
  return page.evaluate(() => (
    window as typeof window & { clipboardWrites: string[] }
  ).clipboardWrites);
}
