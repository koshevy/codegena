import type { GeneratedFileDetailsScope } from '@codegena/playground-ui/preferences';
import { useCallback } from 'react';

type GeneratedSelectionChangeHandler = (
  ids: string[],
  selectedNodeId?: string,
  isShiftSelection?: boolean,
  explicitSelectionCount?: number,
  explicitSelectedNodeIds?: string[],
) => void;

export function usePlaygroundDetailsScope(
  onSelectChange: (
    ids: string[],
    selectedNodeId?: string,
    shouldRevealFile?: boolean,
    explicitSelectedNodeIds?: string[],
  ) => void,
  detailsScope: GeneratedFileDetailsScope,
): GeneratedSelectionChangeHandler {
  return useCallback((
    ids: string[],
    selectedNodeId?: string,
    _isShiftSelection?: boolean,
    _explicitSelectionCount?: number,
    explicitSelectedNodeIds?: string[],
  ): void => {
    onSelectChange(
      ids,
      selectedNodeId,
      detailsScope === 'all',
      explicitSelectedNodeIds,
    );
  }, [
    detailsScope,
    onSelectChange,
  ]);
}
