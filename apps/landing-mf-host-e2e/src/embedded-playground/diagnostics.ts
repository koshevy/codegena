import type { Page } from '@playwright/test';

import { observeLandingDiagnostics } from '../landing-journey';

/**
 * Send native window errors, including resize-delivery errors, to the same
 * diagnostics collector as browser console errors.
 */
export async function observeEmbeddedDiagnostics(page: Page): Promise<() => void> {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.addInitScript(() => {
    window.addEventListener('error', (event) => {
      console.error('Window error:', event.message);
    });
  });

  return expectNoDiagnostics;
}
