import {
  ThemedScrollAreaStyles,
  useThemedScrollArea,
} from '@codegena/ui-unified/scrolling';
import Typography from '@mui/material/Typography';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {
  type MouseEvent,
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { GeneratedFilesListTreeEntries } from './generated-files-list-tree-entries';
import type { GeneratedFilesListProps } from './generated-files-list.props';
import {
  generatedFilesListClasses,
  GeneratedFilesListStyles,
} from './generated-files-list.styles';
import { useGeneratedFilesListSelection } from './use-generated-files-list-selection';
import { useGeneratedFilesTree } from './use-generated-files-tree';
import { VirtualGeneratedFilesTree } from './virtualized-tree';

const emptySelectedNodeIds: string[] = [];

export function GeneratedFilesList({
  contextMenuNodeId,
  defaultSelectedNodeIds,
  expandedFileIds,
  graph,
  implicitSelectedNodeIds,
  isActive = true,
  onSelectChange,
  onNodeContextMenu,
  onExpandedFileIdsChange,
  onWarningClick,
  sortMode = 'filename',
  title,
}: GeneratedFilesListProps): ReactElement {
  const {
    clearSelection,
    expandedItems,
    getContextActions,
    handleItemClick,
    handleSelectedItemsChange,
    handleWarningClick,
    rootRef,
    selectedNodeIds,
    setExpandedItems,
  } = useGeneratedFilesListSelection({
    defaultSelectedNodeIds,
    expandedFileIds,
    graph,
    implicitSelectedNodeIds,
    isActive,
    onExpandedFileIdsChange,
    onSelectChange,
    onWarningClick,
  });

  const fileGroups = useGeneratedFilesTree(graph.nodes, sortMode);
  const scrollHostRef = useRef<HTMLDivElement>(null);
  const shouldShowFullFilePath = sortMode === 'source';
  const isLargeFileTree = useMemo(() => (
    graph.nodes.filter((node) => (
      node.data.kind === 'directory' || node.data.kind === 'group'
    )).length > 1000
  ), [graph.nodes]);

  const renderedTitle = title && (
    <Typography
      color="text.secondary"
      gutterBottom
      variant="overline"
    >
      {title}
    </Typography>
  );

  useThemedScrollArea(scrollHostRef, rootRef);

  const handleContextMenu = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    if (!onNodeContextMenu) {
      return;
    }

    const target = event.target;

    const element = target instanceof Element
      ? target.closest<HTMLElement>('[data-node-id]')
      : null;

    const nodeId = element?.dataset['nodeId'];

    if (!nodeId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onNodeContextMenu(event, nodeId, getContextActions(nodeId));
  }, [
    getContextActions,
    onNodeContextMenu,
  ]);

  const handleEmptySpaceClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target;

    if (target instanceof Element && target.closest('[role="treeitem"]')) {
      return;
    }

    clearSelection();
  }, [clearSelection]);

  const handleExpandedItemsChange = useCallback((
    _event: SyntheticEvent | null,
    ids: string[],
  ): void => {
    setExpandedItems(ids);
  }, [setExpandedItems]);

  const handleToggleItem = useCallback((nodeId: string): void => {
    setExpandedItems((current) => (
      current.includes(nodeId)
        ? current.filter((id) => id !== nodeId)
        : [...current, nodeId]
    ));
  }, [setExpandedItems]);

  const renderedVirtualTree = isLargeFileTree && (
    <VirtualGeneratedFilesTree
      contextMenuNodeId={contextMenuNodeId}
      defaultSelectedNodeIds={defaultSelectedNodeIds ?? emptySelectedNodeIds}
      entries={fileGroups}
      expandedItems={expandedItems}
      isActive={isActive}
      onSelect={handleItemClick}
      onToggle={handleToggleItem}
      onWarningClick={handleWarningClick}
      rootRef={rootRef}
      selectedNodeIds={selectedNodeIds}
      shouldShowFullFilePath={shouldShowFullFilePath}
    />
  );

  const renderedStandardTree = !isLargeFileTree && (
    <SimpleTreeView
      aria-label="Generated files"
      expandedItems={expandedItems}
      expansionTrigger="iconContainer"
      itemChildrenIndentation="1rem"
      multiSelect
      onExpandedItemsChange={handleExpandedItemsChange}
      onItemClick={handleItemClick}
      onSelectedItemsChange={handleSelectedItemsChange}
      selectedItems={[...selectedNodeIds]}
    >
      <GeneratedFilesListTreeEntries
        contextMenuNodeId={contextMenuNodeId}
        entries={fileGroups}
        expandedItems={expandedItems}
        onWarningClick={handleWarningClick}
        shouldShowFullFilePath={shouldShowFullFilePath}
      />
    </SimpleTreeView>
  );

  return (
    <ThemedScrollAreaStyles
      ref={scrollHostRef}
      sx={{ p: '0.4rem 0.6rem 0.4rem 0.4rem' }}
    >
      <GeneratedFilesListStyles
        className={generatedFilesListClasses.root}
        onClick={handleEmptySpaceClick}
        onContextMenu={handleContextMenu}
        ref={rootRef}
      >
        {renderedTitle}
        {renderedVirtualTree}
        {renderedStandardTree}
      </GeneratedFilesListStyles>
    </ThemedScrollAreaStyles>
  );
}
