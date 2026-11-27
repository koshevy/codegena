import { CodegenaDarkTheme, CodegenaLightTheme } from '@codegena/ui-theme';
import type { ThemeMode } from '@codegena/ui-unified/menus';
import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export function usePlaygroundColorMode(mode: ThemeMode): Theme {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });

  const effectiveMode = mode === 'system'
    ? (prefersDark ? 'dark' : 'light')
    : mode;

  return effectiveMode === 'dark' ? CodegenaDarkTheme : CodegenaLightTheme;
}
