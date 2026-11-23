import type { ReactElement } from 'react';

import type { ThemeModeMenuProps } from './theme-mode-menu.props';
import { useContextMenuItems } from './use-context-menu-items';
import { ContextMenu } from '../context-menu';

export function ThemeModeMenu({
  anchor,
  mode,
  onChange,
  onClose,
}: ThemeModeMenuProps): ReactElement {
  const items = useContextMenuItems(mode, onChange);

  return (
    <ContextMenu
      anchor={anchor}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      ariaLabel="Theme mode"
      header="Appearance"
      items={items}
      onClose={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    />
  );
}
