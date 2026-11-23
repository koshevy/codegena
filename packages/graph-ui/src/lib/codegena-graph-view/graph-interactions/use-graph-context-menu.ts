import type { GraphPayload, GraphPayloadLog } from '@codegena/graph-core';
import type { Node } from '@xyflow/react';
import { type MouseEvent, useCallback } from 'react';

import type {
  GraphNodeContextMenuHandler,
  GraphPaneContextMenuHandler,
} from './graph-context-menu';
import { deselectSelectedNode } from '../graph-selection';

interface GraphContextMenuOptions {
  expandedDirectoryIds: ReadonlySet<string>;
  explicitlySelectedIds: Set<string>;
  graph: GraphPayload;
  onNodeContextMenu?: GraphNodeContextMenuHandler;
  onPaneContextMenu?: GraphPaneContextMenuHandler;
  onWarningClick?: (log: GraphPayloadLog) => void;
  selectedNodeIds: Set<string>;
  toggleDirectory: (directoryId: string) => void;
  updateSelection: (
    ids: Set<string>,
    selectedNodeId?: string,
    isAdditive?: boolean,
  ) => void;
}

export function useGraphContextMenu({
  expandedDirectoryIds,
  explicitlySelectedIds,
  graph,
  onNodeContextMenu,
  onPaneContextMenu,
  onWarningClick,
  selectedNodeIds,
  toggleDirectory,
  updateSelection,
}: GraphContextMenuOptions): {
  handleFlowNodeContextMenu: (event: MouseEvent, node: Node) => void;
  handlePaneContextMenu: (event: MouseEvent | globalThis.MouseEvent) => void;
} {
  const handleNodeContextMenu = useCallback((event: MouseEvent, nodeId: string): void => {
    if (!onNodeContextMenu) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onNodeContextMenu(event, nodeId, {
      areSelected: (nodeIds) => nodeIds.every((id) => selectedNodeIds.has(id)),
      directoryExpansion: graph.nodes.some(({ id, data }) => (
        id === nodeId && data.kind === 'directory' && id !== '.'
      ))
        ? {
            isExpanded: expandedDirectoryIds.has(nodeId),
            toggle: () => toggleDirectory(nodeId),
          }
        : undefined,
      isSelected: selectedNodeIds.has(nodeId),
      revealWarning: (log) => {
        if (!selectedNodeIds.has(nodeId)) {
          updateSelection(new Set([nodeId]), nodeId);
        }

        onWarningClick?.(log);
      },
      select: (isAdditive) => {
        const nextIds = isAdditive
          ? new Set([...explicitlySelectedIds, nodeId])
          : new Set([nodeId]);

        updateSelection(nextIds, nodeId, isAdditive);
      },
      selectMany: (nodeIds, isAdditive) => {
        const nextIds = new Set(
          isAdditive ? [...explicitlySelectedIds, ...nodeIds] : nodeIds,
        );

        updateSelection(nextIds, nodeId, isAdditive);
      },
      unselect: (isAdditive) => {
        const nextIds = isAdditive
          ? deselectSelectedNode(graph, explicitlySelectedIds, nodeId)
          : new Set<string>();

        updateSelection(nextIds, undefined, isAdditive);
      },
    });
  }, [
    expandedDirectoryIds,
    explicitlySelectedIds,
    graph,
    onNodeContextMenu,
    onWarningClick,
    selectedNodeIds,
    toggleDirectory,
    updateSelection,
  ]);

  const handleFlowNodeContextMenu = useCallback((event: MouseEvent, node: Node): void => {
    handleNodeContextMenu(event, node.id);
  }, [handleNodeContextMenu]);

  const handlePaneContextMenu = useCallback((
    event: MouseEvent | globalThis.MouseEvent,
  ): void => {
    if (!onPaneContextMenu) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onPaneContextMenu(event, () => updateSelection(new Set()));
  }, [
    onPaneContextMenu,
    updateSelection,
  ]);

  return { handleFlowNodeContextMenu, handlePaneContextMenu };
}
