import type { ThemeMode } from '@codegena/ui-unified/menus';
import type { Theme } from '@mui/material/styles';
import { useContext } from 'react';

import type { PlaygroundAppearance } from './playground-appearance';
import { PlaygroundAppearanceContext } from './playground-appearance-context';
import { usePlaygroundColorMode } from './use-playground-color-mode';

interface PlaygroundAppearanceState extends PlaygroundAppearance {
  theme?: Theme;
}

export function usePlaygroundAppearance(
  savedMode: ThemeMode,
  onSavedModeChange: PlaygroundAppearance['onModeChange'],
): PlaygroundAppearanceState {
  const appearance = useContext(PlaygroundAppearanceContext);
  const theme = usePlaygroundColorMode(savedMode);

  return appearance ?? { mode: savedMode, onModeChange: onSavedModeChange, theme };
}
