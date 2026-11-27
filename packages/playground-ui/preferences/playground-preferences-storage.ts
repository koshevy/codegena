import type { ThemeMode } from '@codegena/ui-unified/menus';

import type { GeneratedView } from './generated-view';
import type {
  InitialPlaygroundPreferences,
  PlaygroundPanelWidths,
  PlaygroundPreferences,
} from './playground-preferences';

export const defaultPlaygroundPersistenceKey = 'codegena.playground.preferences.v1';
export const defaultOpenPanelWidth = (25 / 90) * 100;

const themeModes: readonly string[] = ['light', 'dark', 'system'];

function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && themeModes.includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPanelWidth(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
    && value >= 0 && value <= 100;
}

function isOpenPanelWidth(value: unknown): value is number {
  return isPanelWidth(value) && value >= 10 && value <= 90;
}

export function parsePlaygroundPanelWidths(
  value: unknown,
): PlaygroundPanelWidths | null {
  if (!isRecord(value)) {
    return null;
  }

  const source = value['source'];
  const generated = value['generated'];
  const details = value['details'];

  if (
    !isPanelWidth(source)
    || !isPanelWidth(generated)
    || !isPanelWidth(details)
    || generated < 10
    || Math.abs(source + generated + details - 100) > 1
  ) {
    return null;
  }

  return { source, generated, details };
}

export function getDefaultPlaygroundPreferences(
  isSourceOpenByDefault: boolean,
  defaultGeneratedView: GeneratedView,
  defaultThemeMode: ThemeMode,
): PlaygroundPreferences {
  const source = isSourceOpenByDefault ? defaultOpenPanelWidth : 0;

  return {
    detailsOpenWidth: defaultOpenPanelWidth,
    detailsScope: 'selected',
    generatedView: defaultGeneratedView,
    layout: { source, generated: 100 - source, details: 0 },
    sortMode: 'filename',
    sourceOpenWidth: defaultOpenPanelWidth,
    themeMode: defaultThemeMode,
  };
}

export function readPlaygroundPreferences(
  persistenceKey: string | null,
  isSourceOpenByDefault: boolean,
  defaultGeneratedView: GeneratedView,
  defaultThemeMode: ThemeMode,
): InitialPlaygroundPreferences {
  const fallback = getDefaultPlaygroundPreferences(
    isSourceOpenByDefault,
    defaultGeneratedView,
    defaultThemeMode,
  );

  if (!persistenceKey || typeof window === 'undefined') {
    return { preferences: fallback, restored: false };
  }

  try {
    const stored = window.localStorage.getItem(persistenceKey);

    return parseStoredPlaygroundPreferences(stored, fallback);
  }
  catch {
    return { preferences: fallback, restored: false };
  }
}

function parseStoredPlaygroundPreferences(
  stored: string | null,
  fallback: PlaygroundPreferences,
): InitialPlaygroundPreferences {
  const parsed: unknown = stored ? JSON.parse(stored) : null;

  if (!isRecord(parsed)) {
    return { preferences: fallback, restored: false };
  }

  const layout = parsePlaygroundPanelWidths(parsed['layout']);
  const sourceOpenWidth = parsed['sourceOpenWidth'];
  const detailsOpenWidth = parsed['detailsOpenWidth'];
  const generatedView = parsed['generatedView'];
  const detailsScope = parsed['detailsScope'];

  if (
    !layout
    || !isOpenPanelWidth(sourceOpenWidth)
    || !isOpenPanelWidth(detailsOpenWidth)
    || (generatedView !== 'graph' && generatedView !== 'list')
    || (detailsScope !== 'selected' && detailsScope !== 'all')
  ) {
    return { preferences: fallback, restored: false };
  }

  const storedThemeMode = parsed['themeMode'];
  const sortMode = parsed['sortMode'] === 'source'
    ? 'source'
    : 'filename';

  const themeMode = isThemeMode(storedThemeMode)
    ? storedThemeMode
    : fallback.themeMode;

  return {
    preferences: {
      detailsOpenWidth,
      detailsScope,
      generatedView,
      layout,
      sortMode,
      sourceOpenWidth,
      themeMode,
    },
    restored: true,
  };
}

export function savePlaygroundPreferences(
  persistenceKey: string | null,
  preferences: PlaygroundPreferences,
): void {
  if (!persistenceKey || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(persistenceKey, JSON.stringify(preferences));
  }
  catch {
    // The playground remains usable when storage is unavailable.
  }
}
