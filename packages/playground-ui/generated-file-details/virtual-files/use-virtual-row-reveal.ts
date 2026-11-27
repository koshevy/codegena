import type { GraphPayloadGroupNode, GraphPayloadLog } from '@codegena/graph-core';
import { revealHighlightDurationMs } from '@codegena/ui-unified/scrolling';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { VirtualFilesVirtualizer } from './virtual-files-virtualizer';
import { getWarningKey } from '../warning-logs';

interface VirtualRowRevealOptions {
  detailsOpen: boolean;
  directoryCount: number;
  focusRevision: number;
  files: GraphPayloadGroupNode[];
  focusedFileId?: string;
  focusedWarning?: GraphPayloadLog;
  highlightFocusedWarning: boolean;
  logs: GraphPayloadLog[];
  scrollBehavior: ScrollBehavior;
  scrollElement: HTMLDivElement | null;
  virtualizer: VirtualFilesVirtualizer;
}

interface RowHighlight {
  index: number;
  version: number;
}

interface RevealFocus {
  revision: number;
  warning?: GraphPayloadLog;
}

interface VirtualRowRevealResult {
  clearHighlight: () => void;
  highlightedRow?: RowHighlight;
  onHighlightStart: () => void;
}

export function useVirtualRowReveal({
  detailsOpen,
  directoryCount,
  focusRevision,
  files,
  focusedFileId,
  focusedWarning,
  highlightFocusedWarning,
  logs,
  scrollBehavior,
  scrollElement,
  virtualizer,
}: VirtualRowRevealOptions): VirtualRowRevealResult {
  const lastFileFocusRef = useRef<{
    fileId: string;
    revision: number;
  } | undefined>(undefined);

  const lastWarningFocusRef = useRef<{
    index: number;
    warning: GraphPayloadLog;
  } | undefined>(undefined);

  const [clearedFocus, setClearedFocus] = useState<RevealFocus>();
  const [startedFocus, setStartedFocus] = useState<RevealFocus>();
  const virtualItems = virtualizer.getVirtualItems();

  const fileIndex = useMemo(() => {
    const index = focusedFileId
      ? files.findIndex(({ id }) => id === focusedFileId)
      : -1;

    return index < 0 ? -1 : directoryCount + index;
  }, [
    directoryCount,
    files,
    focusedFileId,
  ]);

  const warningIndex = useMemo(() => {
    if (!focusedWarning) {
      return -1;
    }

    const warningKey = getWarningKey(focusedWarning);

    return logs.findIndex((log) => getWarningKey(log) === warningKey);
  }, [
    focusedWarning,
    logs,
  ]);

  const clearHighlight = useCallback((): void => {
    setStartedFocus(undefined);
    setClearedFocus({
      revision: focusRevision,
      warning: focusedWarning,
    });
  }, [
    focusRevision,
    focusedWarning,
  ]);

  useEffect(() => {
    if (!detailsOpen || !focusedFileId) {
      lastFileFocusRef.current = undefined;
      return;
    }

    const lastFocus = lastFileFocusRef.current;

    if (
      !scrollElement
      || (lastFocus?.fileId === focusedFileId
        && lastFocus.revision === focusRevision)
    ) {
      return;
    }

    if (fileIndex < 0) {
      return;
    }

    lastFileFocusRef.current = {
      fileId: focusedFileId,
      revision: focusRevision,
    };
    virtualizer.scrollToIndex(fileIndex, { align: 'start', behavior: scrollBehavior });
  }, [
    detailsOpen,
    fileIndex,
    focusRevision,
    focusedFileId,
    scrollBehavior,
    scrollElement,
    virtualizer,
  ]);

  useEffect(() => {
    if (!detailsOpen || !focusedWarning) {
      lastWarningFocusRef.current = undefined;
      return;
    }

    if (!scrollElement || warningIndex < 0) {
      return;
    }

    const index = files.length + directoryCount + 1 + warningIndex;
    const lastFocus = lastWarningFocusRef.current;

    if (lastFocus?.warning === focusedWarning && lastFocus.index === index) {
      return;
    }

    lastWarningFocusRef.current = { index, warning: focusedWarning };
    virtualizer.scrollToIndex(index, { align: 'start', behavior: scrollBehavior });
  }, [
    detailsOpen,
    directoryCount,
    files.length,
    focusedWarning,
    scrollBehavior,
    scrollElement,
    virtualizer,
    warningIndex,
  ]);

  const targetIndex = files.length + directoryCount + 1 + warningIndex;

  const isHighlightMounted = highlightFocusedWarning
    && warningIndex >= 0
    && virtualItems.some(({ index }) => index === targetIndex);

  const isFocusCleared = clearedFocus?.revision === focusRevision
    && clearedFocus.warning === focusedWarning;

  const hasStartedHighlight = startedFocus?.revision === focusRevision
    && startedFocus.warning === focusedWarning;

  const hasToHighlight = isHighlightMounted
    && !isFocusCleared
    && (hasStartedHighlight || !virtualizer.isScrolling);

  const highlightedRow = hasToHighlight
    ? { index: targetIndex, version: focusRevision }
    : undefined;

  const onHighlightStart = useCallback((): void => {
    setStartedFocus((current) => {
      const isSameFocus = current?.revision === focusRevision
        && current.warning === focusedWarning;

      return isSameFocus
        ? current
        : {
            revision: focusRevision,
            warning: focusedWarning,
          };
    });
  }, [
    focusRevision,
    focusedWarning,
  ]);

  useEffect(() => {
    if (!hasStartedHighlight) {
      return;
    }

    const timeout = window.setTimeout(() => {
      clearHighlight();
    }, revealHighlightDurationMs);

    return () => window.clearTimeout(timeout);
  }, [
    clearHighlight,
    hasStartedHighlight,
  ]);

  return { clearHighlight, highlightedRow, onHighlightStart };
}
