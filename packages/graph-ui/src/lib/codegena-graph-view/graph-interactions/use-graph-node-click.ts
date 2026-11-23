import type { GraphPayload, GraphPayloadLog } from '@codegena/graph-core';
import type { NodeMouseHandler } from '@xyflow/react';
import { useCallback } from 'react';

import { toggleSelectedNode } from '../graph-selection';

interface GraphNodeClickOptions {
  activeNodeIds: ReadonlySet<string>;
  explicitlySelectedIds: ReadonlySet<string>;
  graph: GraphPayload;
  onDeclarationGlyphClick?: (nodeId: string, wasExplicitlySelected: boolean) => void;
  onWarningClick?: (log: GraphPayloadLog) => void;
  updateSelection: (
    ids: Set<string>,
    selectedNodeId?: string,
    isShiftSelection?: boolean,
  ) => void;
}

export function useGraphNodeClick({
  activeNodeIds,
  explicitlySelectedIds,
  graph,
  onDeclarationGlyphClick,
  onWarningClick,
  updateSelection,
}: GraphNodeClickOptions): NodeMouseHandler {
  return useCallback<NodeMouseHandler>((event, node) => {
    const warningButton = event.target instanceof Element
      && event.target.closest('[data-graph-warning-trigger]');

    if (warningButton) {
      const sourceNode = graph.nodes.find(({ id }) => id === node.id);

      const warning = sourceNode?.data.kind === 'item'
        ? sourceNode.data.logs.find(({ level }) => level === 'warn' || level === 'error')
        : undefined;

      if (warning && !activeNodeIds.has(node.id)) {
        updateSelection(new Set([node.id]), node.id);
      }

      if (warning) {
        onWarningClick?.(warning);
      }

      return;
    }

    const declarationGlyph = event.target instanceof Element
      && event.target.closest('[data-declaration-type-glyph]');

    if (declarationGlyph) {
      onDeclarationGlyphClick?.(node.id, explicitlySelectedIds.has(node.id));

      const selectedIds = activeNodeIds.has(node.id)
        ? new Set([...explicitlySelectedIds, node.id])
        : toggleSelectedNode(graph, explicitlySelectedIds, node.id, event.shiftKey);

      updateSelection(selectedIds, node.id, event.shiftKey);
      return;
    }

    updateSelection(
      toggleSelectedNode(graph, explicitlySelectedIds, node.id, event.shiftKey),
      node.id,
      event.shiftKey,
    );
  }, [
    activeNodeIds,
    explicitlySelectedIds,
    graph,
    onDeclarationGlyphClick,
    onWarningClick,
    updateSelection,
  ]);
}
