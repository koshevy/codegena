import {
  type GraphPayload,
  getGraphSelectionState,
} from '@codegena/graph-core';
import type { GeneratedFileDetailsScope } from '@codegena/playground-ui/preferences';
import { useCallback } from 'react';

export function usePlaygroundDetailsDirectorySelection(
  graph: GraphPayload,
  onSelectChange: (
    ids: string[],
    selectedNodeId?: string,
    shouldRevealFile?: boolean,
    explicitSelectedNodeIds?: string[],
  ) => void,
  setDetailsScope: (scope: GeneratedFileDetailsScope) => void,
): (directoryId: string) => void {
  return useCallback((directoryId: string): void => {
    const activeIds = getGraphSelectionState(
      graph,
      new Set([directoryId]),
    ).activeNodeIds;

    setDetailsScope('selected');
    onSelectChange([...activeIds], directoryId, false, [directoryId]);
  }, [
    graph,
    onSelectChange,
    setDetailsScope,
  ]);
}
