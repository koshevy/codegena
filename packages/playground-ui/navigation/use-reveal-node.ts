import type { GraphPayload, GraphPayloadNode } from '@codegena/graph-core';
import { useCallback } from 'react';

import type { PlaygroundNavigationState } from './use-playground-navigation-state';

interface RevealNodeOptions {
  graph: GraphPayload;
  onNodeVisited: (node: GraphPayloadNode) => void;
  showDetailsPanel: () => void;
  state: PlaygroundNavigationState;
}

export function useRevealNode({
  graph,
  onNodeVisited,
  showDetailsPanel,
  state,
}: RevealNodeOptions): (nodeId: string, shouldRevealFile?: boolean) => void {
  const {
    latestWarningFocusRef,
    setExplicitSelectedNodeIds,
    setFocusedFileId,
    setFocusedWarning,
    setFocusRevision,
    setImplicitSelectedNodeIds,
    setSelectedGeneratedLine,
    setSelectedNodeIds,
  } = state;

  return useCallback((nodeId, shouldRevealFile = true): void => {
    const node = graph.nodes.find(({ id }) => id === nodeId);

    if (node?.data.kind !== 'item' || !('parentId' in node)) {
      return;
    }

    onNodeVisited(node);
    setSelectedNodeIds([nodeId]);
    setExplicitSelectedNodeIds([nodeId]);
    setImplicitSelectedNodeIds([]);
    setSelectedGeneratedLine(undefined);
    latestWarningFocusRef.current = undefined;
    setFocusedWarning(undefined);
    setFocusedFileId(shouldRevealFile ? node.parentId : undefined);

    if (shouldRevealFile) {
      setFocusRevision((current) => current + 1);
      showDetailsPanel();
    }
  }, [
    graph,
    latestWarningFocusRef,
    onNodeVisited,
    setExplicitSelectedNodeIds,
    setFocusedFileId,
    setFocusedWarning,
    setFocusRevision,
    setImplicitSelectedNodeIds,
    setSelectedGeneratedLine,
    setSelectedNodeIds,
    showDetailsPanel,
  ]);
}
