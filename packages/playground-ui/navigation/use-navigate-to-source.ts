import type {
  GraphPayload,
  GraphPayloadNode,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import { useCallback } from 'react';

import type { PlaygroundNavigationState } from './use-playground-navigation-state';

interface NavigateToSourceOptions {
  graph: GraphPayload;
  isSourceOpen: boolean;
  onNodeVisited: (node: GraphPayloadNode) => void;
  showSourcePanel: () => void;
  state: PlaygroundNavigationState;
}

export function useNavigateToSource({
  graph,
  isSourceOpen,
  onNodeVisited,
  showSourcePanel,
  state,
}: NavigateToSourceOptions): (
  location: GraphPayloadSourceLocation,
  generatedDeclarationId?: string,
  generatedLine?: number,
) => void {
  const {
    latestWarningFocusRef,
    setExplicitSelectedNodeIds,
    setFocusedFileId,
    setFocusedWarning,
    setImplicitSelectedNodeIds,
    setNavigationTarget,
    setSelectedGeneratedLine,
    setSelectedNodeIds,
  } = state;

  return useCallback((location, generatedDeclarationId, generatedLine): void => {
    setNavigationTarget({ ...location });

    const declaration = generatedDeclarationId
      ? graph.nodes.find(({ id }) => id === generatedDeclarationId)
      : undefined;

    setSelectedGeneratedLine(
      declaration?.data.kind === 'item' ? generatedLine : undefined,
    );

    if (declaration?.data.kind === 'item' && declaration.parentId) {
      onNodeVisited(declaration);
      setSelectedNodeIds([declaration.id, declaration.parentId]);
      setExplicitSelectedNodeIds([declaration.id]);
      setImplicitSelectedNodeIds([declaration.parentId]);
      latestWarningFocusRef.current = undefined;
      setFocusedWarning(undefined);
      setFocusedFileId(undefined);
    }

    if (!isSourceOpen) {
      showSourcePanel();
    }
  }, [
    graph.nodes,
    latestWarningFocusRef,
    onNodeVisited,
    setExplicitSelectedNodeIds,
    setFocusedFileId,
    setFocusedWarning,
    setImplicitSelectedNodeIds,
    setNavigationTarget,
    setSelectedGeneratedLine,
    setSelectedNodeIds,
    showSourcePanel,
    isSourceOpen,
  ]);
}
