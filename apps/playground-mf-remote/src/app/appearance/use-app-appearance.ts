import type { PlaygroundAppearance } from '@codegena/playground-ui/appearance';
import { useCallback, useState } from 'react';

import { readThemeMode, writeThemeMode } from './theme-mode-storage';

export function useAppAppearance(
  appearance?: PlaygroundAppearance,
): PlaygroundAppearance {
  const [mode, setMode] = useState(readThemeMode);

  const handleModeChange = useCallback<PlaygroundAppearance['onModeChange']>((next) => {
    setMode(next);
    writeThemeMode(next);
  }, []);

  return appearance ?? { mode, onModeChange: handleModeChange };
}
