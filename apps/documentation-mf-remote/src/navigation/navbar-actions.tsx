import { GitHubLink } from '@codegena/ui-unified/branding';
import { ThemeModeSwitcher } from '@codegena/ui-unified/menus';
import type { ReactElement } from 'react';

import { NavbarActionsStyles } from './navbar-actions.styles';
import { useDocumentationThemeMode } from './use-documentation-theme-mode';

export function NavbarActions(): ReactElement {
  const {
    mode,
    onChange: handleModeChange,
  } = useDocumentationThemeMode();

  return (
    <NavbarActionsStyles>
      <ThemeModeSwitcher
        mode={mode}
        onChange={handleModeChange}
      />
      <GitHubLink href="https://github.com/koshevy/codegena" />
    </NavbarActionsStyles>
  );
}
