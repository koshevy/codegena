import {
  type GraphPayload,
  getGraphSelectionState,
  toggleSelectedNode,
} from '@codegena/graph-core';
import { useCallback } from 'react';

interface PlaygroundDetailsFileSelectionOptions {
  explicitSelectedNodeIds: string[];
  graph: GraphPayload;
  onSelectChange: (
    ids: string[],
    selectedNodeId?: string,
    isShiftSelection?: boolean,
    explicitSelectionCount?: number,
    explicitSelectedNodeIds?: string[],
  ) => void;
}

export function usePlaygroundDetailsFileSelection({
  explicitSelectedNodeIds,
  graph,
  onSelectChange,
}: PlaygroundDetailsFileSelectionOptions): (
  fileId: string,
  isShiftSelection: boolean,
) => void {
  return useCallback((fileId, isShiftSelection): void => {
    const explicitIds = toggleSelectedNode(
      graph,
      new Set(explicitSelectedNodeIds),
      fileId,
      isShiftSelection,
    );

    const activeIds = getGraphSelectionState(graph, explicitIds).activeNodeIds;

    onSelectChange(
      [...activeIds],
      explicitIds.has(fileId) ? fileId : undefined,
      isShiftSelection,
      explicitIds.size,
      [...explicitIds],
    );
  }, [
    explicitSelectedNodeIds,
    graph,
    onSelectChange,
  ]);
}
