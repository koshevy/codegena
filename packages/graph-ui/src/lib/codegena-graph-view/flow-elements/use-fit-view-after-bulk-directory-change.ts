import { type RefObject, useEffect, useRef } from 'react';

/**
 * Keeps a bulk directory change's fit pending until layout completes.
 */
export function useFitViewAfterBulkDirectoryChange(
  fitViewRevision: number,
  expandedDirectoryIds: ReadonlySet<string>,
): RefObject<boolean> {
  const pendingFitViewRef = useRef(false);
  const previousRevisionRef = useRef(fitViewRevision);
  const previousExpandedIdsRef = useRef(expandedDirectoryIds);

  useEffect(() => {
    if (fitViewRevision !== previousRevisionRef.current) {
      pendingFitViewRef.current = true;
    }
    else if (expandedDirectoryIds !== previousExpandedIdsRef.current) {
      pendingFitViewRef.current = false;
    }

    previousRevisionRef.current = fitViewRevision;
    previousExpandedIdsRef.current = expandedDirectoryIds;
  }, [
    fitViewRevision,
    expandedDirectoryIds,
  ]);

  return pendingFitViewRef;
}
