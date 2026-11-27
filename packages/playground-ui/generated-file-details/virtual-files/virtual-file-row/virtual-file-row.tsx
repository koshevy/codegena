import type {
  GraphPayloadGroupNode,
  GraphPayloadDirectoryNode,
  GraphPayloadItemNode,
  GraphPayloadLog,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import { WarningDetailed, WarningsListHeader } from '@codegena/playground-ui/misc-ui';
import { revealHighlightClass } from '@codegena/ui-unified/scrolling';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { memo, type ReactElement, type Ref } from 'react';

import { VirtualFileRowStyles } from './virtual-file-row.styles';
import { GeneratedFileDetailsDirectory } from '../../directory';
import { GeneratedFileDetailsFile } from '../../file';

export type VirtualFileRowKind = 'file' | 'directory' | 'warnings-header' | 'warning';

interface VirtualFileRowProps {
  declarations?: GraphPayloadItemNode[];
  directory?: GraphPayloadDirectoryNode;
  editorHeight: number;
  file?: GraphPayloadGroupNode;
  highlightVersion?: number;
  index: number;
  isHighlighted: boolean;
  isOnlyFile: boolean;
  isScrolling: boolean;
  isSelected: boolean;
  log?: GraphPayloadLog;
  logs: GraphPayloadLog[];
  measureElement: Ref<HTMLDivElement>;
  onHighlightStart: () => void;
  onNavigateToSource?: (
    location: GraphPayloadSourceLocation,
    generatedDeclarationId?: string,
  ) => void;
  onSelectFile?: (fileId: string, isShiftSelection: boolean) => void;
  onSelectDirectory?: (directoryId: string) => void;
  rowKind: VirtualFileRowKind;
  scrollMargin: number;
  selectedLine?: number;
  sourceSchemaText: string;
  start: number;
}

export const VirtualFileRow = memo(function VirtualFileRowInner({
  declarations,
  directory,
  editorHeight,
  file,
  highlightVersion,
  index,
  isHighlighted,
  isOnlyFile,
  isScrolling,
  isSelected,
  log,
  logs,
  measureElement,
  onHighlightStart,
  onNavigateToSource,
  onSelectFile,
  onSelectDirectory,
  rowKind,
  scrollMargin,
  selectedLine,
  sourceSchemaText,
  start,
}: VirtualFileRowProps): ReactElement {
  const isWarningsHeader = rowKind === 'warnings-header';
  const renderedFile = file && (
    <GeneratedFileDetailsFile
      declarations={declarations}
      editorHeight={editorHeight}
      file={file}
      isOnlyFile={isOnlyFile}
      isScrolling={isScrolling}
      isSelected={isSelected}
      onNavigateToSource={onNavigateToSource}
      onSelectFile={onSelectFile}
      selectedLine={selectedLine}
    />
  );
  const renderedDirectory = directory && (
    <GeneratedFileDetailsDirectory
      directory={directory}
      onSelect={onSelectDirectory}
    />
  );
  const renderedWarningsHeader = isWarningsHeader && (
    <WarningsListHeader
      logs={logs}
      sourceSchemaText={sourceSchemaText}
    />
  );
  const renderedWarning = log && (
    <WarningDetailed
      log={log}
      onNavigateToSource={onNavigateToSource}
      sourceSchemaText={sourceSchemaText}
    />
  );
  const renderedHighlight = isHighlighted && (
    <Box
      className={revealHighlightClass}
      key={highlightVersion}
      onAnimationStart={onHighlightStart}
    />
  );

  return (
    <VirtualFileRowStyles
      className={clsx({
        [revealHighlightClass]: isHighlighted,
      })}
      data-details-row={rowKind}
      data-index={index}
      ref={measureElement}
      sx={{
        left: 0,
        position: 'absolute',
        top: 0,
        transform: `translateY(${start - scrollMargin}px)`,
        width: '100%',
      }}
    >
      {renderedFile}
      {renderedDirectory}
      {renderedWarningsHeader}
      {renderedWarning}
      {renderedHighlight}
    </VirtualFileRowStyles>
  );
});
