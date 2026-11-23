import { ThemeModeSwitcher } from '@codegena/ui-unified/menus';
import type { ReactElement } from 'react';

import { useAppearance } from '../../appearance';

export function ThemeSwitcher(): ReactElement {
  const {
    mode,
    setMode: handleModeChange,
  } = useAppearance();

  return (
    <ThemeModeSwitcher
      mode={mode}
      onChange={handleModeChange}
    />
  );
}
