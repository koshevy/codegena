import { useColorMode } from '@docusaurus/theme-common';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useContext, useEffect } from 'react';

import { DocumentationHostContext } from '../navigation';

/**
 * Use the host's explicit choice when embedded and keep Infima in that same mode.
 */
export function useDocumentationColorMode(): 'dark' | 'light' {
  const { appearance } = useContext(DocumentationHostContext);

  const {
    colorMode,
    setColorMode,
  } = useColorMode();
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = appearance?.mode;

  useEffect(() => {
    if (mode !== undefined) {
      setColorMode(mode === 'system' ? null : mode);
    }
  }, [
    mode,
    setColorMode,
  ]);

  if (!mode) {
    return colorMode;
  }

  const systemMode = isSystemDark ? 'dark' : 'light';

  return mode === 'system' ? systemMode : mode;
}
