import { type MouseEvent, useCallback, useState } from 'react';

import type { ContextMenuItem } from '../../menus/context-menu';

interface PanelHeaderContextMenu {
  handleClose: () => void;
  handleContextMenu: (event: MouseEvent) => void;
  menuPosition: { left: number; top: number } | null;
}

export function usePanelHeaderContextMenu(
  items: ContextMenuItem[] | undefined,
): PanelHeaderContextMenu {
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const handleContextMenu = useCallback((event: MouseEvent): void => {
    if (!items?.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setMenuPosition({ left: event.clientX, top: event.clientY });
  }, [
    items,
  ]);

  const handleClose = useCallback((): void => {
    setMenuPosition(null);
  }, []);

  return { handleClose, handleContextMenu, menuPosition };
}
