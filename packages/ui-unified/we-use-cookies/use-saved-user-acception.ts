import { useSyncExternalStore } from 'react';

import { readCookieConsent, subscribeToCookieConsent } from './cookie-consent-storage';
import type { CookieConsent } from './we-use-cookies.props';

function readServerConsent(): undefined {
  // Keep the drawer closed while the server renders and the client hydrates.
}

export function useCookieConsentSnapshot(): CookieConsent | null | undefined {
  return useSyncExternalStore(
    subscribeToCookieConsent,
    readCookieConsent,
    readServerConsent,
  );
}

/**
 * Returns the saved browser choice, or null before a visitor has made one.
 */
export function useSavedUserAcception(): CookieConsent | null {
  return useCookieConsentSnapshot() ?? null;
}
