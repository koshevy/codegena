import type { ThemeMode } from '@codegena/ui-unified/menus';

export const themePreferenceStorageKey = 'codegena:landing:theme';

const themeModes = ['dark', 'light', 'system'] as const;

function readStoredPreference(): string | null {
  try {
    return localStorage.getItem(themePreferenceStorageKey);
  }
  catch {
    // Keep the original appearance when browser storage is unavailable.
    return null;
  }
}

export function getDefaultThemePreference(): ThemeMode {
  return 'dark';
}

export function readThemePreference(): ThemeMode {
  const storedMode = readStoredPreference();

  return themeModes.find((mode) => mode === storedMode) ?? getDefaultThemePreference();
}

export function writeThemePreference(mode: ThemeMode): void {
  try {
    localStorage.setItem(themePreferenceStorageKey, mode);
  }
  catch {
    // Theme selection still works when the browser blocks persistence.
  }
}
