import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { type ReactElement, type ReactNode, useMemo } from 'react';

import type { PlaygroundAppearance } from './playground-appearance';
import { PlaygroundAppearanceContext } from './playground-appearance-context';
import { usePlaygroundColorMode } from './use-playground-color-mode';

interface PlaygroundAppearanceProviderProps extends PlaygroundAppearance {
  children: ReactNode;
}

/**
 * Places loading views and Playground under the same controlled theme.
 * Playground inherits this provider instead of restoring a separate theme.
 */
export function PlaygroundAppearanceProvider({
  children,
  mode,
  onModeChange,
}: PlaygroundAppearanceProviderProps): ReactElement {
  const theme = usePlaygroundColorMode(mode);

  const appearance = useMemo(() => ({ mode, onModeChange }), [
    mode,
    onModeChange,
  ]);

  return (
    <PlaygroundAppearanceContext.Provider value={appearance}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </PlaygroundAppearanceContext.Provider>
  );
}
