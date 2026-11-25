import { useCallback, useState, useSyncExternalStore } from 'react';

const storageKey = 'codegena:under-construction';

function subscribeToSessionStorage(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);

  return () => window.removeEventListener('storage', onChange);
}

function hasStoredAcknowledgment(): boolean {
  try {
    return window.sessionStorage.getItem(storageKey) === 'acknowledged';
  }
  catch {
    return false;
  }
}

function readServerAcknowledgment(): undefined {
  // The browser checks its tab's storage after hydration.
}

export function useConstructionAcknowledgment(): {
  acknowledge: () => void;
  hasAcknowledged: boolean | undefined;
} {
  const hasStoredChoice = useSyncExternalStore(
    subscribeToSessionStorage,
    hasStoredAcknowledgment,
    readServerAcknowledgment,
  );
  const [isDismissed, setIsDismissed] = useState(false);

  const acknowledge = useCallback((): void => {
    try {
      window.sessionStorage.setItem(storageKey, 'acknowledged');
    }
    catch {
      // Dismiss for this page even if browser storage is unavailable.
    }

    setIsDismissed(true);
  }, []);

  return { acknowledge, hasAcknowledged: isDismissed || hasStoredChoice };
}
