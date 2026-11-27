import type { ThemeMode } from '@codegena/ui-unified/menus';
import { useColorMode } from '@docusaurus/theme-common';
import { useCallback, useContext } from 'react';

import { DocumentationHostContext } from './documentation-host-context';

export function useDocumentationThemeMode(): {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
} {
  const { appearance } = useContext(DocumentationHostContext);

  const {
    colorModeChoice,
    setColorMode,
  } = useColorMode();

  const onChange = useCallback((mode: ThemeMode): void => {
    if (appearance) {
      appearance.onModeChange(mode);

      return;
    }

    setColorMode(mode === 'system' ? null : mode);
  }, [
    appearance,
    setColorMode,
  ]);

  return { mode: appearance?.mode ?? colorModeChoice ?? 'system', onChange };
}
