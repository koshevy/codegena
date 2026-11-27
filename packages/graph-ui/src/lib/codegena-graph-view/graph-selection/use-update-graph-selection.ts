import { getGraphSelectionState, type GraphPayload } from '@codegena/graph-core';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
} from 'react';

export type GraphSelectionChangeHandler = (
  selectedNodeIds: string[],
  selectedNodeId?: string,
  isShiftSelection?: boolean,
  explicitSelectionCount?: number,
  explicitSelectedNodeIds?: string[],
) => void;

export function useUpdateGraphSelection(
  graph: GraphPayload,
  explicitlySelectedIds: ReadonlySet<string>,
  setExplicitlySelectedIds: Dispatch<SetStateAction<Set<string>>>,
  recordLocalSelection: (ids: string[]) => void,
  onSelectChange?: GraphSelectionChangeHandler,
): (
  nextExplicitIds: Set<string>,
  selectedNodeId?: string,
  isShiftSelection?: boolean,
) => void {
  return useCallback((
    nextExplicitIds: Set<string>,
    selectedNodeId?: string,
    isShiftSelection = false,
  ): void => {
    const isExplicitSelectionChanged = nextExplicitIds.size !== explicitlySelectedIds.size
      || [...nextExplicitIds].some((id) => !explicitlySelectedIds.has(id));

    if (!isExplicitSelectionChanged) {
      return;
    }

    const { activeNodeIds } = getGraphSelectionState(graph, nextExplicitIds);

    setExplicitlySelectedIds(nextExplicitIds);

    if (!onSelectChange) {
      return;
    }

    const explicitNodeIds = [...nextExplicitIds];

    recordLocalSelection(explicitNodeIds);
    onSelectChange(
      graph.nodes
        .filter(({ id }) => activeNodeIds.has(id))
        .map(({ id }) => id),
      selectedNodeId && nextExplicitIds.has(selectedNodeId)
        ? selectedNodeId
        : undefined,
      isShiftSelection,
      nextExplicitIds.size,
      explicitNodeIds,
    );
  }, [
    explicitlySelectedIds,
    graph,
    onSelectChange,
    recordLocalSelection,
    setExplicitlySelectedIds,
  ]);
}
