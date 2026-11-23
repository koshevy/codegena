import type { ThemeMode } from '@codegena/ui-unified/menus';
import { useCallback, useEffect, useState } from 'react';
import type { Layout, LayoutChangedMeta } from 'react-resizable-panels';

import type { GeneratedFileDetailsScope } from './generated-file-details-scope';
import type { GeneratedFileSortMode } from './generated-file-sort-mode';
import type { GeneratedView } from './generated-view';
import type {
  InitialPlaygroundPreferences,
  PlaygroundPreferences,
} from './playground-preferences';
import {
  readPlaygroundPreferences,
  savePlaygroundPreferences,
} from './playground-preferences-storage';
import { usePlaygroundLayoutChanged } from './use-playground-layout-changed';

interface PlaygroundPreferencesState {
  handleLayoutChanged: (layout: Layout, meta: LayoutChangedMeta) => void;
  initial: InitialPlaygroundPreferences;
  preferences: PlaygroundPreferences;
  setDetailsScope: (scope: GeneratedFileDetailsScope) => void;
  setGeneratedView: (view: GeneratedView) => void;
  setSortMode: (sortMode: GeneratedFileSortMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export function usePlaygroundPreferences(
  persistenceKey: string | null,
  isSourceOpenByDefault: boolean,
  defaultGeneratedView: GeneratedView,
  defaultThemeMode: ThemeMode,
): PlaygroundPreferencesState {
  const [initial] = useState(() => readPlaygroundPreferences(
    persistenceKey,
    isSourceOpenByDefault,
    defaultGeneratedView,
    defaultThemeMode,
  ));

  const [preferences, setPreferences] = useState(initial.preferences);

  useEffect(() => {
    savePlaygroundPreferences(persistenceKey, preferences);
  }, [
    persistenceKey,
    preferences,
  ]);

  const handleLayoutChanged = usePlaygroundLayoutChanged(setPreferences);

  const setDetailsScope = useCallback((scope: GeneratedFileDetailsScope): void => {
    setPreferences((current) => (
      current.detailsScope === scope ? current : { ...current, detailsScope: scope }
    ));
  }, []);

  const setGeneratedView = useCallback((view: GeneratedView): void => {
    setPreferences((current) => (
      current.generatedView === view ? current : { ...current, generatedView: view }
    ));
  }, []);

  const setSortMode = useCallback((sortMode: GeneratedFileSortMode): void => {
    setPreferences((current) => (
      current.sortMode === sortMode ? current : { ...current, sortMode }
    ));
  }, []);

  const setThemeMode = useCallback((themeMode: ThemeMode): void => {
    setPreferences((current) => (
      current.themeMode === themeMode ? current : { ...current, themeMode }
    ));
  }, []);

  return {
    handleLayoutChanged,
    initial,
    preferences,
    setDetailsScope,
    setGeneratedView,
    setSortMode,
    setThemeMode,
  };
}
