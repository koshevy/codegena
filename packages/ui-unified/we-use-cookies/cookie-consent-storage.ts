import type { CookieConsent } from './we-use-cookies.props';

const storageKey = 'codegena:cookie-consent';
const consentChangeEvent = 'codegena:cookie-consent-change';
const sessionConsent: { choice: CookieConsent | null } = { choice: null };

function readStoredChoice(): string | null {
  try {
    return window.localStorage.getItem(storageKey);
  }
  catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsent | null {
  const value = sessionConsent.choice ?? readStoredChoice();
  const isConsent = value === 'acceptAll' || value === 'disableAnalytics';

  return isConsent ? value : null;
}

export function saveCookieConsent(choice: CookieConsent): void {
  try {
    window.localStorage.setItem(storageKey, choice);
    sessionConsent.choice = null;
  }
  catch {
    // Keep the decision for this page when browser storage is unavailable.
    sessionConsent.choice = choice;
  }

  window.dispatchEvent(new Event(consentChangeEvent));
}

export function subscribeToCookieConsent(onChange: () => void): () => void {
  function handleStorageChange(event: StorageEvent): void {
    const isConsentChange = event.key === storageKey || event.key === null;

    if (isConsentChange) {
      sessionConsent.choice = null;
      onChange();
    }
  }

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener(consentChangeEvent, onChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener(consentChangeEvent, onChange);
  };
}
