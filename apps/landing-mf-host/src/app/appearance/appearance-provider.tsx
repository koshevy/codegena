import { CodegenaDarkTheme, CodegenaLightTheme } from '@codegena/ui-theme';
import type { ThemeMode } from '@codegena/ui-unified/menus';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { type Appearance, AppearanceContext } from './appearance-context';
import {
  getDefaultThemePreference,
  readThemePreference,
  writeThemePreference,
} from './theme-preference-storage';
import { useHydrationSnapshot } from '../hydration';

interface AppearanceProviderProps {
  children: ReactNode;
}

/**
 * Owns the saved theme choice and shares its controls with menus and themed views.
 */
export function AppearanceProvider({
  children,
}: AppearanceProviderProps): ReactElement {
  const savedMode = useHydrationSnapshot(readThemePreference, getDefaultThemePreference);
  const [selectedMode, setSelectedMode] = useState<ThemeMode>();
  const themeMode = selectedMode ?? savedMode;

  const setMode = useCallback((nextMode: ThemeMode): void => {
    setSelectedMode(nextMode);
    writeThemePreference(nextMode);
  }, []);

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const isDark = themeMode === 'dark' || (themeMode === 'system' && prefersDark);
  const theme = isDark ? CodegenaDarkTheme : CodegenaLightTheme;

  const appearance = useMemo<Appearance>(() => ({ mode: themeMode, setMode }), [
    themeMode,
    setMode,
  ]);

  return (
    <AppearanceContext.Provider value={appearance}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </AppearanceContext.Provider>
  );
}
