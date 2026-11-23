import Box from '@mui/material/Box';
import {
  useVirtualizer,
  useWindowVirtualizer,
} from '@tanstack/react-virtual';
import {
  forwardRef,
  type ReactElement,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import { useReportWarningVisibility } from './use-report-warning-visibility';
import { useVirtualOptions } from './use-virtual-options';
import { useVirtualRowReveal } from './use-virtual-row-reveal';
import { VirtualFilesRows } from './virtual-files-rows';
import type { VirtualFilesProps } from './virtual-files.props';
import type { VirtualFilesHandle } from './virtual-files.types';

export const VirtualFiles = forwardRef<VirtualFilesHandle, VirtualFilesProps>(
  function VirtualFilesInner({
    declarationsByFileId,
    detailsOpen,
    directories,
    focusRevision,
    editorHeights,
    files,
    focusedFileId,
    focusedWarning,
    highlightFocusedWarning,
    initialScrollSnapshot,
    logs,
    onNavigateToSource,
    onSelectFile,
    onSelectDirectory,
    onScrollSnapshotChange,
    onWarningVisibilityChange,
    selectedFileIds,
    scrollAnchor,
    scrollBehavior,
    scrollElement,
    scrollMode,
    selectedLineByFileId,
    showAllFiles,
    sourceSchemaText,
  }: VirtualFilesProps, ref): ReactElement {
    const listRef = useRef<HTMLDivElement>(null);

    const getScrollElement = useCallback((): HTMLDivElement | null => (
      scrollElement
    ), [scrollElement]);

    const {
      handleVirtualizerChange,
      scrollMargin,
      sharedOptions,
    } = useVirtualOptions({
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
    });

    const elementVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
      ...sharedOptions,
      enabled: scrollMode === 'element',
      getScrollElement,
      onChange: handleVirtualizerChange,
    });

    const windowVirtualizer = useWindowVirtualizer<HTMLDivElement>({
      ...sharedOptions,
      enabled: scrollMode === 'window',
      onChange: handleVirtualizerChange,
    });

    const virtualizer = scrollMode === 'window'
      ? windowVirtualizer
      : elementVirtualizer;

    const {
      clearHighlight,
      highlightedRow,
      onHighlightStart,
    } = useVirtualRowReveal({
      detailsOpen,
      directoryCount: directories.length,
      focusRevision,
      files,
      focusedFileId,
      focusedWarning,
      highlightFocusedWarning,
      logs,
      scrollBehavior,
      scrollElement,
      virtualizer,
    });

    useImperativeHandle(ref, () => ({
      scrollToWarnings: () => {
        if (!scrollElement || logs.length === 0) {
          return;
        }

        clearHighlight();
        virtualizer.scrollToIndex(files.length + directories.length, {
          align: 'start',
          behavior: scrollBehavior,
        });
      },
    }), [
      clearHighlight,
      files.length,
      directories.length,
      logs.length,
      scrollBehavior,
      scrollElement,
      virtualizer,
    ]);

    useReportWarningVisibility(
      virtualizer,
      files.length + directories.length + 1,
      onWarningVisibilityChange,
    );

    return (
      <Box
        data-file-count={files.length}
        data-warning-count={logs.length}
        ref={listRef}
        sx={{ position: 'relative' }}
      >
        <VirtualFilesRows
          declarationsByFileId={declarationsByFileId}
          directories={directories}
          editorHeights={editorHeights}
          files={files}
          highlightedRow={highlightedRow}
          logs={logs}
          onHighlightStart={onHighlightStart}
          onNavigateToSource={onNavigateToSource}
          onSelectFile={onSelectFile}
          onSelectDirectory={onSelectDirectory}
          scrollMargin={scrollMargin}
          selectedLineByFileId={selectedLineByFileId}
          selectedFileIds={selectedFileIds}
          showAllFiles={showAllFiles}
          sourceSchemaText={sourceSchemaText}
          virtualizer={virtualizer}
        />
      </Box>
    );
  });
