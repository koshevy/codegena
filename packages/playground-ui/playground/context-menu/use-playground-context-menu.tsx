import type { GeneratedView } from '@codegena/playground-ui/preferences';
import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import { type MouseEvent, useCallback, useState } from 'react';

import { useContextMenuItems } from './use-context-menu-items';

interface PlaygroundContextMenuOptions {
  detailsOpen: boolean;
  generatedView: GeneratedView;
  onToggleDetails: () => void;
  onGeneratedViewChange: (view: GeneratedView) => void;
  onToggleSource: () => void;
  sourceOpen: boolean;
}

export function usePlaygroundContextMenu({
  detailsOpen,
  generatedView,
  onToggleDetails,
  onGeneratedViewChange,
  onToggleSource,
  sourceOpen,
}: PlaygroundContextMenuOptions): {
  handleClose: () => void;
  handleContextMenu: (event: MouseEvent<HTMLElement>) => void;
  items: ContextMenuItem[];
  position: { left: number; top: number } | null;
} {
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  const toggleGeneratedView = useCallback((): void => {
    onGeneratedViewChange(generatedView === 'graph' ? 'list' : 'graph');
  }, [
    generatedView,
    onGeneratedViewChange,
  ]);

  const handleContextMenu = useCallback((
    event: MouseEvent<HTMLElement>,
  ): void => {
    event.preventDefault();
    setPosition({ left: event.clientX, top: event.clientY });
  }, []);

  const handleClose = useCallback((): void => {
    setPosition(null);
  }, []);

  const items = useContextMenuItems({
    detailsOpen,
    generatedView,
    onToggleDetails,
    onToggleGeneratedView: toggleGeneratedView,
    onToggleSource,
    sourceOpen,
  });

  return {
    handleClose,
    handleContextMenu,
    items,
    position,
  };
}
