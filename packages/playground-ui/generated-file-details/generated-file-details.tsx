import { useThemedScrollArea } from '@codegena/ui-unified/scrolling';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import {
  type ReactElement,
  useCallback,
  useRef,
  useState,
} from 'react';

import type { GeneratedFileDetailsProps } from './generated-file-details.props';
import {
  generatedFileDetailsClasses,
  GeneratedFileDetailsContainerStyles,
  GeneratedFileDetailsStyles,
} from './generated-file-details.styles';
import { GeneratedFileDetailsPlaceholder } from './placeholder';
import { useGeneratedFileDetailsContent } from './use-generated-file-details-content';
import { VirtualFiles, type VirtualFilesHandle } from './virtual-files';
import { GeneratedFileDetailsWarningShortcut } from './warning-shortcut';

const emptySelectedNodeIds: string[] = [];

export function GeneratedFileDetails({
  detailsOpen = false,
  explicitSelectedNodeIds = emptySelectedNodeIds,
  focusRevision = 0,
  focusedFileId,
  focusedWarning,
  graph,
  highlightFocusedWarning = false,
  initialScrollSnapshot,
  onNavigateToSource,
  onSelectFile,
  onSelectDirectory,
  onScrollSnapshotChange,
  onShowAllFiles,
  scrollAnchor = 'start',
  selectedGeneratedLine,
  selectedNodeIds,
  showAllFiles = false,
  scrollMode = 'element',
  sourceSchemaText,
}: GeneratedFileDetailsProps): ReactElement {
  const scrollHostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const [hasVisibleWarning, setHasVisibleWarning] = useState(false);
  const virtualFilesRef = useRef<VirtualFilesHandle>(null);

  useThemedScrollArea(scrollHostRef, rootRef, {
    enabled: scrollMode === 'element',
  });

  const setRootRef = useCallback((element: HTMLDivElement | null): void => {
    rootRef.current = element;
    setScrollElement(element);
  }, []);

  const {
    declarationsByFileId,
    editorHeights,
    hasToShowPlaceholder,
    hasToShowVirtualList,
    hasWarnings,
    scrollBehavior,
    selectedLineByFileId,
    selectedFileIds,
    uniqueWarningLogs,
    visibleDirectories,
    visibleFiles,
  } = useGeneratedFileDetailsContent({
    explicitSelectedNodeIds,
    focusedWarning,
    graph,
    selectedGeneratedLine,
    selectedNodeIds,
    showAllFiles,
  });

  const scrollToWarnings = useCallback((): void => {
    virtualFilesRef.current?.scrollToWarnings();
  }, []);

  const hasToShowHasWarningButton = hasWarnings && !hasVisibleWarning;
  const isWindowScroll = scrollMode === 'window';
  const renderedPlaceholder = hasToShowPlaceholder && (
    <GeneratedFileDetailsPlaceholder onShowAllFiles={onShowAllFiles} />
  );
  const renderedVirtualList = hasToShowVirtualList && (
    <Box className={generatedFileDetailsClasses.files}>
      <VirtualFiles
        declarationsByFileId={declarationsByFileId}
        detailsOpen={detailsOpen}
        directories={visibleDirectories}
        focusRevision={focusRevision}
        editorHeights={editorHeights}
        files={visibleFiles}
        focusedFileId={focusedFileId}
        focusedWarning={focusedWarning}
        highlightFocusedWarning={highlightFocusedWarning}
        initialScrollSnapshot={initialScrollSnapshot}
        logs={uniqueWarningLogs}
        onNavigateToSource={onNavigateToSource}
        onSelectFile={onSelectFile}
        onSelectDirectory={onSelectDirectory}
        onScrollSnapshotChange={onScrollSnapshotChange}
        onWarningVisibilityChange={setHasVisibleWarning}
        ref={virtualFilesRef}
        scrollAnchor={scrollAnchor}
        scrollBehavior={scrollBehavior}
        scrollElement={scrollElement}
        scrollMode={scrollMode}
        selectedLineByFileId={selectedLineByFileId}
        selectedFileIds={selectedFileIds}
        showAllFiles={showAllFiles}
        sourceSchemaText={sourceSchemaText}
      />
    </Box>
  );
  const renderedWarningShortcut = hasToShowHasWarningButton && (
    <GeneratedFileDetailsWarningShortcut
      isWindowScroll={isWindowScroll}
      onClick={scrollToWarnings}
    />
  );

  return (
    <GeneratedFileDetailsContainerStyles
      className={clsx({
        [generatedFileDetailsClasses.container]: true,
        [generatedFileDetailsClasses.windowScroll]: isWindowScroll,
      })}
      ref={scrollHostRef}
    >
      <GeneratedFileDetailsStyles
        aria-label="Generated file details"
        className={clsx({
          [generatedFileDetailsClasses.root]: true,
          [generatedFileDetailsClasses.windowScroll]: isWindowScroll,
        })}
        ref={setRootRef}
        role="region"
      >
        {renderedPlaceholder}
        {renderedVirtualList}
      </GeneratedFileDetailsStyles>
      {renderedWarningShortcut}
    </GeneratedFileDetailsContainerStyles>
  );
}
