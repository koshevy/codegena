import type {
  GraphPayload,
  GraphNodeContextActions,
} from '@codegena/graph-core';
import type { GeneratedView } from '@codegena/playground-ui/preferences';
import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import { SquareDashedX } from 'lucide-react';
import { useMemo } from 'react';

import { createDirectoryContextMenuItems } from './create-directory-context-menu-items';
import { createNodeContextMenuItems } from './create-node-context-menu-items';
import { useContextMenuItems } from './use-context-menu-items';

export type GeneratedOutputMenuContext = {
  actions: GraphNodeContextActions;
  kind: 'node';
  nodeId: string;
  position: { left: number; top: number };
} | {
  clearSelection: () => void;
  kind: 'pane';
  position: { left: number; top: number };
};

interface ViewContextMenuItemsProps {
  canCollapseDirectories: boolean;
  canExpandDirectories: boolean;
  contextMenu?: GeneratedOutputMenuContext;
  detailsOpen: boolean;
  detailsScope: 'all' | 'selected';
  generatedView: GeneratedView;
  graph: GraphPayload;
  directoryCount: number;
  hasCollapsedFiles: boolean;
  hasExpandedFiles: boolean;
  onClearSelection: () => void;
  onCollapseAll: () => void;
  onCollapseAllDirectories: () => void;
  onExpandAll: () => void;
  onExpandAllDirectories: () => void;
  onRevealInSpecification: (nodeId: string) => void;
  onShowInDetails: (nodeId: string, scope: 'all' | 'selected') => void;
  selectedNodeIds: string[];
  sourceOpen: boolean;
}

export function useViewContextMenuItems({
  canCollapseDirectories,
  canExpandDirectories,
  contextMenu,
  detailsOpen,
  detailsScope,
  generatedView,
  graph,
  directoryCount,
  hasCollapsedFiles,
  hasExpandedFiles,
  onClearSelection,
  onCollapseAll,
  onCollapseAllDirectories,
  onExpandAll,
  onExpandAllDirectories,
  onRevealInSpecification,
  onShowInDetails,
  selectedNodeIds,
  sourceOpen,
}: ViewContextMenuItemsProps): ContextMenuItem[] {
  const clearSelection = contextMenu?.kind === 'pane'
    ? contextMenu.clearSelection
    : onClearSelection;

  const paneItems = useContextMenuItems({
    canCollapseDirectories,
    canExpandDirectories,
    directoryCount,
    generatedView,
    hasCollapsedFiles,
    hasExpandedFiles,
    hasSelection: selectedNodeIds.length > 0,
    onClearSelection: clearSelection,
    onCollapseAll,
    onCollapseAllDirectories,
    onExpandAll,
    onExpandAllDirectories,
  });

  return useMemo(() => {
    if (!contextMenu) {
      return [];
    }

    if (contextMenu.kind === 'node') {
      return createNodeContextMenuItems({
        actions: contextMenu.actions,
        detailsOpen,
        detailsScope,
        graph,
        nodeId: contextMenu.nodeId,
        onRevealInSpecification,
        onShowInDetails,
        selectedNodeIds,
        sourceOpen,
      });
    }

    if (generatedView === 'list') {
      return paneItems;
    }

    return [
      ...createDirectoryContextMenuItems({
        canCollapseDirectories,
        canExpandDirectories,
        directoryCount,
        onCollapseAllDirectories,
        onExpandAllDirectories,
      }),
      {
        disabled: selectedNodeIds.length === 0,
        icon: <SquareDashedX aria-hidden />,
        id: 'clear-selection',
        label: 'Clear selection',
        onSelect: contextMenu.clearSelection,
      },
    ];
  }, [
    canCollapseDirectories,
    canExpandDirectories,
    contextMenu,
    detailsOpen,
    detailsScope,
    directoryCount,
    generatedView,
    graph,
    onCollapseAllDirectories,
    onExpandAllDirectories,
    onRevealInSpecification,
    onShowInDetails,
    paneItems,
    selectedNodeIds,
    sourceOpen,
  ]);
}
