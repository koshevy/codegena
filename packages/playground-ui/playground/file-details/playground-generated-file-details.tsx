import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import { GeneratedFileDetails } from '@codegena/playground-ui/generated-file-details';
import type { GeneratedFileDetailsScope } from '@codegena/playground-ui/preferences';
import { PanelHeader, PanelHeaderToolbar } from '@codegena/ui-unified/panels';
import { FileCodeCorner } from 'lucide-react';
import { type ReactElement, useCallback, useMemo } from 'react';

import { DownloadAllButton, useDownloadAllArchive } from './download-all-button';
import {
  PlaygroundGeneratedFileDetailsDirectoryNotice,
} from './playground-generated-file-details-directory-notice';
import { useContextMenuItems } from './use-context-menu-items';
import { useToolbarButtons } from './use-toolbar-buttons';

interface PlaygroundGeneratedFileDetailsProps {
  detailsOpen: boolean;
  explicitSelectedNodeIds: string[];
  focusRevision: number;
  focusedWarning?: GraphPayloadLog;
  focusedFileId?: string;
  // todo: GraphPayload is redundant for this level.
  //       Move handle of download button clickto higher level.
  graph: GraphPayload;
  highlightFocusedWarning: boolean;
  onNavigateToSource: (
    location: GraphPayloadSourceLocation,
    generatedDeclarationId?: string,
  ) => void;
  onSelectDirectory: (directoryId: string) => void;
  onSelectFile: (fileId: string, isShiftSelection: boolean) => void;
  onHide: () => void;
  onScopeChange: (scope: GeneratedFileDetailsScope) => void;
  scope: GeneratedFileDetailsScope;
  selectedGeneratedLine?: number;
  selectedNodeIds: string[];
  sourceSchemaText: string;
}

export function PlaygroundGeneratedFileDetails({
  detailsOpen,
  explicitSelectedNodeIds,
  focusRevision,
  focusedWarning,
  focusedFileId,
  graph,
  highlightFocusedWarning,
  onNavigateToSource,
  onSelectDirectory,
  onSelectFile,
  onHide,
  onScopeChange,
  scope,
  selectedGeneratedLine,
  selectedNodeIds,
  sourceSchemaText,
}: PlaygroundGeneratedFileDetailsProps): ReactElement {
  const contextMenuItems = useContextMenuItems(onHide);
  const toolbarButtons = useToolbarButtons();
  const { isPending, onDownload } = useDownloadAllArchive(graph);
  const hasToShowAllFiles = scope === 'all';
  const hasHiddenNestedDirectories = useMemo(() => {
    if (!hasToShowAllFiles) {
      return false;
    }

    const selectedIds = new Set(explicitSelectedNodeIds);

    return graph.nodes.some((node) => (
      node.data.kind === 'directory'
      && node.parentId !== undefined
      && selectedIds.has(node.parentId)
    ));
  }, [
    explicitSelectedNodeIds,
    graph.nodes,
    hasToShowAllFiles,
  ]);

  const handleShowSelected = useCallback((): void => {
    onScopeChange('selected');
  }, [onScopeChange]);

  const handleShowAll = useCallback((): void => {
    onScopeChange('all');
  }, [onScopeChange]);

  const renderedDirectoryNotice = hasHiddenNestedDirectories && (
    <PlaygroundGeneratedFileDetailsDirectoryNotice
      onClick={handleShowSelected}
    />
  );

  return (
    <>
      <PanelHeader
        contextMenuItems={contextMenuItems}
        actions={(
          <>
            {renderedDirectoryNotice}
            <DownloadAllButton
              isPending={isPending}
              onClick={onDownload}
            />
            <PanelHeaderToolbar
              ariaLabel="Generated file details scope"
              onChange={onScopeChange}
              options={toolbarButtons}
              value={scope}
            />
          </>
        )}
        icon={(
          <FileCodeCorner
            aria-hidden
            size={18}
          />
        )}
        title="Generated file details"
      />
      <GeneratedFileDetails
        detailsOpen={detailsOpen}
        explicitSelectedNodeIds={explicitSelectedNodeIds}
        focusRevision={focusRevision}
        focusedWarning={focusedWarning}
        focusedFileId={focusedFileId}
        graph={graph}
        highlightFocusedWarning={highlightFocusedWarning}
        onNavigateToSource={onNavigateToSource}
        onSelectDirectory={onSelectDirectory}
        onSelectFile={onSelectFile}
        onShowAllFiles={handleShowAll}
        selectedGeneratedLine={selectedGeneratedLine}
        selectedNodeIds={selectedNodeIds}
        showAllFiles={hasToShowAllFiles}
        sourceSchemaText={sourceSchemaText}
      />
    </>
  );
}
