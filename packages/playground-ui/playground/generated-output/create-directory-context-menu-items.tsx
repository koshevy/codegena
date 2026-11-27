import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import { FolderClosed, FolderOpen } from 'lucide-react';

interface DirectoryContextMenuOptions {
  canCollapseDirectories: boolean;
  canExpandDirectories: boolean;
  directoryCount: number;
  onCollapseAllDirectories: () => void;
  onExpandAllDirectories: () => void;
}

export function createDirectoryContextMenuItems({
  canCollapseDirectories,
  canExpandDirectories,
  directoryCount,
  onCollapseAllDirectories,
  onExpandAllDirectories,
}: DirectoryContextMenuOptions): ContextMenuItem[] {
  const collapseItem: ContextMenuItem = {
    disabled: !canCollapseDirectories,
    icon: <FolderClosed aria-hidden />,
    id: 'collapse-directories',
    label: 'Collapse all directories',
    onSelect: onCollapseAllDirectories,
  };

  const expandItem: ContextMenuItem = {
    disabled: !canExpandDirectories,
    icon: <FolderOpen aria-hidden />,
    id: 'expand-directories',
    label: 'Expand all directories',
    onSelect: onExpandAllDirectories,
  };

  return directoryCount > 0
    ? [collapseItem, expandItem]
    : [collapseItem];
}
