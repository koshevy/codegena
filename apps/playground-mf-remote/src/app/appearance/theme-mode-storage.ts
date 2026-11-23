import type { ThemeMode } from '@codegena/ui-unified/menus';

const storageKey = 'codegena:playground:theme';
// Read the old Playground choice once before this app owned the loading theme.
const legacyStorageKey = 'codegena.playground.preferences.v1';
const modes = ['dark', 'light', 'system'] as const;

function readStoredMode(key: string): string | null {
  try {
    return localStorage.getItem(key);
  }
  catch {
    return null;
  }
}

function readLegacyPreferences(): unknown {
  const stored = readStoredMode(legacyStorageKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  }
  catch {
    return null;
  }
}

export function readThemeMode(): ThemeMode {
  const stored = readStoredMode(storageKey);

  if (stored) {
    return modes.find((mode) => mode === stored) ?? 'system';
  }

  const legacy: unknown = readLegacyPreferences();
  const hasLegacyMode = typeof legacy === 'object' && legacy !== null
    && 'themeMode' in legacy;
  const previousMode = hasLegacyMode ? legacy.themeMode : undefined;

  return modes.find((mode) => mode === previousMode) ?? 'system';
}

export function writeThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(storageKey, mode);
  }
  catch {
    // Appearance remains usable when browser storage is unavailable.
  }
}
