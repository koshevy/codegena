import type {
  GraphPayloadDirectoryNode,
  GraphPayloadGroupNode,
  GraphPayloadItemNode,
  GraphPayloadLog,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import Box from '@mui/material/Box';
import type { ReactElement } from 'react';

import { VirtualFileRow, type VirtualFileRowKind } from './virtual-file-row';
import type { VirtualFilesVirtualizer } from './virtual-files-virtualizer';

interface VirtualFilesRowsProps {
  declarationsByFileId: ReadonlyMap<string, GraphPayloadItemNode[]>;
  directories: GraphPayloadDirectoryNode[];
  editorHeights: ReadonlyMap<string, number>;
  files: GraphPayloadGroupNode[];
  highlightedRow?: { index: number; version: number };
  logs: GraphPayloadLog[];
  onHighlightStart: () => void;
  onNavigateToSource?: (
    location: GraphPayloadSourceLocation,
    generatedDeclarationId?: string,
  ) => void;
  onSelectFile?: (fileId: string, isShiftSelection: boolean) => void;
  onSelectDirectory?: (directoryId: string) => void;
  scrollMargin: number;
  selectedLineByFileId: ReadonlyMap<string, number>;
  selectedFileIds: ReadonlySet<string>;
  showAllFiles: boolean;
  sourceSchemaText: string;
  virtualizer: VirtualFilesVirtualizer;
}

function getRowKind(
  index: number,
  fileCount: number,
  directoryCount: number,
): VirtualFileRowKind {
  if (index < directoryCount) {
    return 'directory';
  }

  if (index < fileCount + directoryCount) {
    return 'file';
  }

  if (index === fileCount + directoryCount) {
    return 'warnings-header';
  }

  return 'warning';
}

export function VirtualFilesRows({
  declarationsByFileId,
  directories,
  editorHeights,
  files,
  highlightedRow,
  logs,
  onHighlightStart,
  onNavigateToSource,
  onSelectFile,
  onSelectDirectory,
  scrollMargin,
  selectedLineByFileId,
  selectedFileIds,
  showAllFiles,
  sourceSchemaText,
  virtualizer,
}: VirtualFilesRowsProps): ReactElement {
  const isOnlyFile = files.length === 1;

  return (
    <Box
      sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}
    >
      {virtualizer.getVirtualItems().map((item) => {
        const rowKind = getRowKind(
          item.index,
          files.length,
          directories.length,
        );

        const file = rowKind === 'file'
          ? files[item.index - directories.length]
          : undefined;

        const directory = rowKind === 'directory'
          ? directories[item.index]
          : undefined;

        const log = rowKind === 'warning'
          ? logs[item.index - files.length - directories.length - 1]
          : undefined;

        const isHighlighted = highlightedRow?.index === item.index;
        const isSelected = showAllFiles && !!file && selectedFileIds.has(file.id);

        const editorHeight = file
          ? editorHeights.get(file.id) ?? 32
          : 32;

        return (
          <VirtualFileRow
            declarations={file ? declarationsByFileId.get(file.id) : undefined}
            directory={directory}
            editorHeight={editorHeight}
            file={file}
            highlightVersion={highlightedRow?.version}
            isHighlighted={isHighlighted}
            index={item.index}
            isOnlyFile={isOnlyFile}
            isScrolling={virtualizer.isScrolling}
            isSelected={isSelected}
            key={item.key}
            log={log}
            logs={logs}
            measureElement={virtualizer.measureElement}
            onHighlightStart={onHighlightStart}
            onNavigateToSource={onNavigateToSource}
            onSelectFile={showAllFiles ? onSelectFile : undefined}
            onSelectDirectory={onSelectDirectory}
            rowKind={rowKind}
            scrollMargin={scrollMargin}
            selectedLine={file ? selectedLineByFileId.get(file.id) : undefined}
            sourceSchemaText={sourceSchemaText}
            start={item.start}
          />
        );
      })}
    </Box>
  );
}
