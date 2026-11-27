import type { GraphPayloadLog } from '@codegena/graph-core';
import { useCallback } from 'react';

import type { PlaygroundNavigationState } from './use-playground-navigation-state';

export function useShowWarnings(
  onLogVisited: (log: GraphPayloadLog) => void,
  showDetailsPanel: () => void,
  state: PlaygroundNavigationState,
): (log: GraphPayloadLog, shouldHighlight?: boolean) => void {
  const {
    latestWarningFocusRef,
    setFocusedFileId,
    setFocusedWarning,
    setFocusRevision,
    setHighlightFocusedWarning,
  } = state;

  return useCallback((log, shouldHighlight = false): void => {
    onLogVisited(log);
    showDetailsPanel();

    const warningFocus = { ...log };

    latestWarningFocusRef.current = warningFocus;
    setFocusedWarning(warningFocus);
    setFocusRevision((current) => current + 1);
    setHighlightFocusedWarning(shouldHighlight);
    setFocusedFileId(undefined);
  }, [
    latestWarningFocusRef,
    onLogVisited,
    setFocusedFileId,
    setFocusedWarning,
    setFocusRevision,
    setHighlightFocusedWarning,
    showDetailsPanel,
  ]);
}
