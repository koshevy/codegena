import type { GraphPayload } from '@codegena/graph-core';
import { type KeyboardEvent, useCallback } from 'react';

import { toggleSelectedNode } from '../graph-selection';

export function useGraphNodeKeyDown(
  graph: GraphPayload,
  explicitlySelectedIds: Set<string>,
  updateSelection: (
    ids: Set<string>,
    selectedNodeId?: string,
    isAdditive?: boolean,
  ) => void,
): (event: KeyboardEvent<HTMLDivElement>) => void {
  return useCallback((event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    const target = event.target;

    if (!(target instanceof HTMLElement)
      || !target.classList.contains('react-flow__node')) {
      return;
    }

    const nodeId = target.dataset['id'];

    if (!nodeId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    updateSelection(
      toggleSelectedNode(graph, explicitlySelectedIds, nodeId, event.shiftKey),
      nodeId,
      event.shiftKey,
    );
  }, [
    explicitlySelectedIds,
    graph,
    updateSelection,
  ]);
}
