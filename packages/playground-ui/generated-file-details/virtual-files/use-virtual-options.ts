import type { Virtualizer, VirtualizerOptions } from '@tanstack/react-virtual';
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';

import { useVirtualFileMargin } from './use-virtual-file-margin';
import type { VirtualFilesProps } from './virtual-files.props';
import type { VirtualFilesScrollSnapshot } from './virtual-files.types';
import { getWarningKey } from '../warning-logs';

const overscan = 3;
const estimatedFileHeight = 360;
const estimatedDirectoryHeight = 70;
const estimatedWarningHeight = 160;
const estimatedWarningHeaderHeight = 32;

type SharedVirtualOptions = Pick<
  VirtualizerOptions<HTMLDivElement, HTMLDivElement>,
  | 'anchorTo'
  | 'count'
  | 'estimateSize'
  | 'followOnAppend'
  | 'gap'
  | 'getItemKey'
  | 'initialMeasurementsCache'
  | 'initialOffset'
  | 'initialRect'
  | 'overscan'
  | 'scrollMargin'
  | 'scrollPaddingStart'
  | 'useAnimationFrameWithResizeObserver'
>;

interface UseVirtualOptionsProps extends Pick<
  VirtualFilesProps,
  | 'editorHeights'
  | 'directories'
  | 'files'
  | 'initialScrollSnapshot'
  | 'logs'
  | 'onScrollSnapshotChange'
  | 'scrollAnchor'
  | 'scrollElement'
  | 'scrollMode'
> {
  listRef: RefObject<HTMLDivElement | null>;
}

interface VirtualOptionsResult {
  handleVirtualizerChange: <TScrollElement extends HTMLDivElement | Window>(
    instance: Virtualizer<TScrollElement, HTMLDivElement>,
    isScrolling: boolean,
  ) => void;
  scrollMargin: number;
  sharedOptions: SharedVirtualOptions;
}

export function useVirtualOptions({
  editorHeights,
  directories,
  files,
  initialScrollSnapshot,
  listRef,
  logs,
  onScrollSnapshotChange,
  scrollAnchor,
  scrollElement,
  scrollMode,
}: UseVirtualOptionsProps): VirtualOptionsResult {
  const latestSnapshotRef = useRef<VirtualFilesScrollSnapshot | undefined>(undefined);

  const { scrollMargin, viewportRect } = useVirtualFileMargin(
    listRef,
    scrollElement,
    scrollMode,
    files.length + directories.length,
  );

  const scrollPaddingStart = useMemo(() => {
    if (!scrollElement) {
      return 8;
    }

    const rootFontSize = getComputedStyle(
      scrollElement.ownerDocument.documentElement,
    ).fontSize;

    return Number(rootFontSize.replace('px', '')) / 2;
  }, [scrollElement]);

  const directoryIds = useMemo(() => (
    directories.map(({ id }) => id)
  ), [
    directories,
  ]);

  const fileIds = useMemo(() => (
    files.map(({ id }) => id)
  ), [
    files,
  ]);

  const warningHeaderIndex = files.length + directories.length;
  const warningRowCount = logs.length > 0 ? logs.length + 1 : 0;

  const getItemKey = useCallback((index: number): string => {
    if (index < directories.length) {
      return `directory:${directories[index].id}`;
    }

    if (index < warningHeaderIndex) {
      return `file:${files[index - directories.length].id}`;
    }

    if (index === warningHeaderIndex) {
      return 'warnings-header';
    }

    return `warning:${getWarningKey(
      logs[index - warningHeaderIndex - 1],
    )}`;
  }, [
    directories,
    files,
    logs,
    warningHeaderIndex,
  ]);

  const handleVirtualizerChange = useCallback(<
    TScrollElement extends HTMLDivElement | Window,
  >(
    instance: Virtualizer<TScrollElement, HTMLDivElement>,
    isScrolling: boolean,
  ): void => {
    if (!onScrollSnapshotChange || !instance.options.enabled || (
      directoryIds.length === 0 && fileIds.length === 0
    )) {
      return;
    }

    const snapshot: VirtualFilesScrollSnapshot = {
      directoryIds,
      fileIds,
      measurements: instance.takeSnapshot(),
      scrollOffset: instance.scrollOffset ?? 0,
    };

    latestSnapshotRef.current = snapshot;

    if (!isScrolling) {
      onScrollSnapshotChange(snapshot);
    }
  }, [
    directoryIds,
    fileIds,
    onScrollSnapshotChange,
  ]);

  useEffect(() => () => {
    if (latestSnapshotRef.current) {
      onScrollSnapshotChange?.(latestSnapshotRef.current);
    }
  }, [onScrollSnapshotChange]);

  const snapshotDirectoryIds = initialScrollSnapshot?.directoryIds ?? [];
  const hasMatchingSnapshot = initialScrollSnapshot?.fileIds.length === fileIds.length
    && initialScrollSnapshot.fileIds.every((id, index) => id === fileIds[index])
    && snapshotDirectoryIds.length === directoryIds.length
    && snapshotDirectoryIds.every((id, index) => (
      id === directoryIds[index]
    ));

  const sharedOptions: SharedVirtualOptions = {
    // Keyed anchoring requires 'end'. Following appended items is controlled
    // separately by followOnAppend.
    anchorTo: 'end',
    count: warningHeaderIndex + warningRowCount,
    estimateSize: (index: number) => {
      if (index < directories.length) {
        return estimatedDirectoryHeight;
      }

      if (index === warningHeaderIndex && logs.length > 0) {
        return estimatedWarningHeaderHeight;
      }

      if (index > warningHeaderIndex) {
        return estimatedWarningHeight;
      }

      const estimatedViewportHeight = typeof window === 'undefined'
        ? 800
        : window.innerHeight;

      const estimatedEditorHeight = editorHeights.get(
        files[index - directories.length].id,
      ) ?? estimatedFileHeight;

      return Math.min(
        estimatedEditorHeight,
        scrollMode === 'window'
          ? estimatedViewportHeight
          : estimatedViewportHeight * (files.length === 1 ? 1 : 0.6),
      );
    },
    followOnAppend: scrollAnchor === 'end',
    gap: 10,
    getItemKey,
    initialRect: viewportRect,
    initialMeasurementsCache: hasMatchingSnapshot
      ? initialScrollSnapshot.measurements.filter(({ index }) => (
          index < warningHeaderIndex
        ))
      : undefined,
    initialOffset: hasMatchingSnapshot ? initialScrollSnapshot.scrollOffset : 0,
    overscan,
    scrollMargin,
    scrollPaddingStart,
    // Warning expansion changes measured rows; commit outside resize delivery.
    useAnimationFrameWithResizeObserver: true,
  };

  return {
    handleVirtualizerChange,
    scrollMargin,
    sharedOptions,
  };
}
