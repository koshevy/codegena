import type { GeneratedView } from '@codegena/playground-ui/preferences';
import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import {
  ListChevronsDownUp,
  ListChevronsUpDown,
  SquareDashedX,
} from 'lucide-react';
import { useMemo } from 'react';

import { createDirectoryContextMenuItems } from './create-directory-context-menu-items';

interface ContextMenuItemsProps {
  canCollapseDirectories: boolean;
  canExpandDirectories: boolean;
  directoryCount: number;
  generatedView: GeneratedView;
  hasCollapsedFiles: boolean;
  hasExpandedFiles: boolean;
  hasSelection: boolean;
  onClearSelection: () => void;
  onCollapseAll: () => void;
  onCollapseAllDirectories: () => void;
  onExpandAllDirectories: () => void;
  onExpandAll: () => void;
}

export function useContextMenuItems({
  canCollapseDirectories,
  canExpandDirectories,
  directoryCount,
  generatedView,
  hasCollapsedFiles,
  hasExpandedFiles,
  hasSelection,
  onClearSelection,
  onCollapseAll,
  onCollapseAllDirectories,
  onExpandAllDirectories,
  onExpandAll,
}: ContextMenuItemsProps): ContextMenuItem[] {
  return useMemo(() => [
    ...createDirectoryContextMenuItems({
      canCollapseDirectories,
      canExpandDirectories,
      directoryCount,
      onCollapseAllDirectories,
      onExpandAllDirectories,
    }),
    {
      disabled: generatedView !== 'list' || !hasExpandedFiles,
      icon: <ListChevronsDownUp aria-hidden />,
      id: 'collapse-all',
      label: 'Collapse all files',
      onSelect: onCollapseAll,
    },
    {
      disabled: generatedView !== 'list' || !hasCollapsedFiles,
      icon: <ListChevronsUpDown aria-hidden />,
      id: 'expand-all',
      label: 'Expand all files',
      onSelect: onExpandAll,
    },
    {
      disabled: !hasSelection,
      icon: <SquareDashedX aria-hidden />,
      id: 'clear-selection',
      label: 'Clear selection',
      onSelect: onClearSelection,
    },
  ], [
    canCollapseDirectories,
    canExpandDirectories,
    directoryCount,
    generatedView,
    hasCollapsedFiles,
    hasExpandedFiles,
    hasSelection,
    onClearSelection,
    onCollapseAll,
    onCollapseAllDirectories,
    onExpandAllDirectories,
    onExpandAll,
  ]);
}
