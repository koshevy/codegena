import {
  getGraphSelectionState,
  type GraphPayload,
  type GraphSelectionState,
} from '@codegena/graph-core';
import { useMemo } from 'react';

export function useGraphSelectionState(
  graph: GraphPayload,
  explicitlySelectedIds: ReadonlySet<string>,
  implicitSelectedNodeIds: readonly string[],
): GraphSelectionState {
  return useMemo(
    () => getGraphSelectionState(
      graph,
      explicitlySelectedIds,
      implicitSelectedNodeIds,
    ),
    [
      graph,
      explicitlySelectedIds,
      implicitSelectedNodeIds,
    ],
  );
}
