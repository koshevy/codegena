import {
  type GraphPayload,
  type GraphPayloadLog,
  deselectSelectedNode,
  type GraphNodeContextActions,
} from '@codegena/graph-core';
import { useCallback } from 'react';

interface GeneratedFilesListContextActionsOptions {
  expandedItems: string[];
  explicitSelectedIds: Set<string>;
  graph: GraphPayload;
  onWarningClick?: (log: GraphPayloadLog) => void;
  selectedNodeIds: Set<string>;
  setExpandedItems: (ids: string[]) => void;
  updateSelection: (
    ids: Set<string>,
    selectedNodeId?: string,
    isShiftSelection?: boolean,
  ) => void;
}

export function useGeneratedFilesListContextActions({
  expandedItems,
  explicitSelectedIds,
  graph,
  onWarningClick,
  selectedNodeIds,
  setExpandedItems,
  updateSelection,
}: GeneratedFilesListContextActionsOptions): (
  nodeId: string,
) => GraphNodeContextActions {
  return useCallback((nodeId: string): GraphNodeContextActions => ({
    areSelected: (nodeIds) => nodeIds.every((id) => selectedNodeIds.has(id)),
    directoryExpansion: graph.nodes.some(({ id, data }) => (
      id === nodeId && data.kind === 'directory' && id !== '.'
    ))
      ? {
          isExpanded: expandedItems.includes(nodeId),
          toggle: () => setExpandedItems(expandedItems.includes(nodeId)
            ? expandedItems.filter((id) => id !== nodeId && !id.startsWith(`${nodeId}/`))
            : [...expandedItems, nodeId]),
        }
      : undefined,
    isSelected: selectedNodeIds.has(nodeId),
    revealWarning: (log) => {
      if (!selectedNodeIds.has(nodeId)) {
        updateSelection(new Set([nodeId]), nodeId);
      }

      onWarningClick?.(log);
    },
    select: (additive) => {
      const nextIds = additive
        ? new Set([...explicitSelectedIds, nodeId])
        : new Set([nodeId]);

      updateSelection(nextIds, nodeId, additive);
    },
    selectMany: (nodeIds, additive) => {
      const nextIds = new Set(
        additive ? [...explicitSelectedIds, ...nodeIds] : nodeIds,
      );

      updateSelection(nextIds, nodeId, additive);
    },
    unselect: (additive) => {
      const nextIds = additive
        ? deselectSelectedNode(graph, explicitSelectedIds, nodeId)
        : new Set<string>();

      updateSelection(nextIds, undefined, additive);
    },
  }), [
    expandedItems,
    explicitSelectedIds,
    graph,
    onWarningClick,
    selectedNodeIds,
    setExpandedItems,
    updateSelection,
  ]);
}
