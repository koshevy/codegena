import {
  CodegenaGraphView,
  type GraphNodeContextActions,
} from '@codegena/graph-ui';
import { GeneratedFilesList } from '@codegena/playground-ui/generated-files-list';
import { ContextMenu } from '@codegena/ui-unified/menus';
import Box from '@mui/material/Box';
import { type MouseEvent, type ReactElement, memo, useCallback, useState } from 'react';

import type {
  PlaygroundGeneratedOutputViewProps,
} from './playground-generated-output-view.props';
import {
  playgroundGeneratedOutputViewClasses,
  PlaygroundGeneratedOutputViewStyles,
} from './playground-generated-output-view.styles';
import {
  useViewContextMenuItems,
  type GeneratedOutputMenuContext,
} from './use-view-context-menu-items';

export const PlaygroundGeneratedOutputView = memo(function GeneratedOutputView({
  canCollapseDirectories,
  canExpandDirectories,
  directoryCount,
  detailsOpen,
  detailsScope,
  expandedDirectoryIds,
  expandedFileIds,
  fitViewRevision,
  generatedView,
  graph,
  hasCollapsedFiles,
  hasExpandedFiles,
  implicitSelectedNodeIds,
  onSelectChange,
  onVisibleEdgeRelationsChange,
  onExpandedDirectoryIdsChange,
  onExpandedFileIdsChange,
  onShowInDetails,
  onRevealInSpecification,
  onCollapseAllDirectories,
  onCollapseAll,
  onExpandAll,
  onExpandAllDirectories,
  onDeclarationGlyphClick,
  onWarningClick,
  selectedNodeIds,
  sortMode,
  sourceOpen,
}: PlaygroundGeneratedOutputViewProps): ReactElement {
  const [contextMenu, setContextMenu] = useState<GeneratedOutputMenuContext>();

  const clearGeneratedSelection = useCallback((): void => {
    onSelectChange([]);
  }, [onSelectChange]);

  const contextMenuItems = useViewContextMenuItems({
    canCollapseDirectories,
    canExpandDirectories,
    contextMenu,
    detailsOpen,
    detailsScope,
    generatedView,
    graph,
    directoryCount,
    hasCollapsedFiles,
    hasExpandedFiles,
    onClearSelection: clearGeneratedSelection,
    onCollapseAll,
    onCollapseAllDirectories,
    onExpandAll,
    onExpandAllDirectories,
    onRevealInSpecification,
    onShowInDetails,
    selectedNodeIds,
    sourceOpen,
  });

  const isGraphActive = generatedView === 'graph';
  const isListActive = generatedView === 'list';
  const isGraphInactive = !isGraphActive;
  const isListInactive = !isListActive;

  const handleNodeContextMenu = useCallback((
    event: MouseEvent,
    nodeId: string,
    actions: GraphNodeContextActions,
  ): void => {
    event.preventDefault();
    setContextMenu({
      actions,
      kind: 'node',
      nodeId,
      position: { left: event.clientX, top: event.clientY },
    });
  }, []);

  const handlePaneContextMenu = useCallback((
    event: MouseEvent | globalThis.MouseEvent,
    clearSelection: () => void,
  ): void => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      clearSelection,
      kind: 'pane',
      position: { left: event.clientX, top: event.clientY },
    });
  }, []);

  const handleEmptySpaceContextMenu = useCallback((event: MouseEvent): void => {
    if (event.defaultPrevented) {
      return;
    }

    handlePaneContextMenu(event, clearGeneratedSelection);
  }, [
    clearGeneratedSelection,
    handlePaneContextMenu,
  ]);

  const handleClose = useCallback((): void => {
    setContextMenu(undefined);
  }, []);

  return (
    <PlaygroundGeneratedOutputViewStyles
      className={playgroundGeneratedOutputViewClasses.root}
      onContextMenu={handleEmptySpaceContextMenu}
    >
      <Box
        aria-hidden={isGraphInactive}
        className={playgroundGeneratedOutputViewClasses.view}
        data-inactive={isGraphInactive}
      >
        <CodegenaGraphView
          defaultSelectedNodeIds={selectedNodeIds}
          embedded
          expandedDirectoryIds={expandedDirectoryIds}
          fitViewRevision={fitViewRevision}
          graph={graph}
          height="100%"
          implicitSelectedNodeIds={implicitSelectedNodeIds}
          isActive={isGraphActive}
          onDeclarationGlyphClick={onDeclarationGlyphClick}
          onSelectChange={onSelectChange}
          onExpandedDirectoryIdsChange={onExpandedDirectoryIdsChange}
          onVisibleEdgeRelationsChange={onVisibleEdgeRelationsChange}
          onNodeContextMenu={handleNodeContextMenu}
          onPaneContextMenu={handlePaneContextMenu}
          onWarningClick={onWarningClick}
        />
      </Box>
      <Box
        aria-hidden={isListInactive}
        className={playgroundGeneratedOutputViewClasses.view}
        data-inactive={isListInactive}
      >
        <GeneratedFilesList
          contextMenuNodeId={contextMenu?.kind === 'node'
            ? contextMenu.nodeId
            : undefined}
          defaultSelectedNodeIds={selectedNodeIds}
          expandedFileIds={expandedFileIds}
          graph={graph}
          implicitSelectedNodeIds={implicitSelectedNodeIds}
          isActive={isListActive}
          onSelectChange={onSelectChange}
          onExpandedFileIdsChange={onExpandedFileIdsChange}
          onNodeContextMenu={handleNodeContextMenu}
          onWarningClick={onWarningClick}
          sortMode={sortMode}
        />
      </Box>
      <ContextMenu
        ariaLabel="Generated output actions"
        items={contextMenuItems}
        onClose={handleClose}
        position={contextMenu?.position ?? null}
      />
    </PlaygroundGeneratedOutputViewStyles>
  );
});
