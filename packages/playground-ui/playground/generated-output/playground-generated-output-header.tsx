import type { GraphPayloadEdgeRelation } from '@codegena/graph-core';
import type { GeneratedFileSortMode, GeneratedView }
  from '@codegena/playground-ui/preferences';
import {
  PanelHeader,
  PanelHeaderToolbar,
  PanelToggle,
} from '@codegena/ui-unified/panels';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { ReactElement } from 'react';

import { EdgeTypeLegend } from './edge-type-legend';
import { GeneratedOutputCounts } from './generated-output-counts';
import {
  PlaygroundGeneratedOutputSortToolbar,
} from './playground-generated-output-sort-toolbar';
import { useContextMenuItems } from './use-context-menu-items';
import { useToolbarButtons } from './use-toolbar-buttons';

export interface PlaygroundGeneratedOutputHeaderProps {
  canCollapseDirectories: boolean;
  canExpandDirectories: boolean;
  detailsOpen: boolean;
  directoryCount: number;
  fileCount: number;
  generatedView: GeneratedView;
  hasCollapsedFiles: boolean;
  hasExpandedFiles: boolean;
  hasSelection: boolean;
  onClearSelection: () => void;
  onCollapseAll: () => void;
  onCollapseAllDirectories: () => void;
  onExpandAllDirectories: () => void;
  onExpandAll: () => void;
  onGeneratedViewChange: (value: GeneratedView) => void;
  onSortModeChange: (sortMode: GeneratedFileSortMode) => void;
  onShowSource: () => void;
  onToggleDetails: () => void;
  sourceOpen: boolean;
  sortMode: GeneratedFileSortMode;
  visibleEdgeRelations: GraphPayloadEdgeRelation[];
}

export function PlaygroundGeneratedOutputHeader({
  canCollapseDirectories,
  canExpandDirectories,
  detailsOpen,
  directoryCount,
  fileCount,
  generatedView,
  hasCollapsedFiles,
  hasExpandedFiles,
  hasSelection,
  onClearSelection,
  onCollapseAll,
  onCollapseAllDirectories,
  onExpandAllDirectories,
  onExpandAll,
  onGeneratedViewChange,
  onSortModeChange,
  onShowSource,
  onToggleDetails,
  sourceOpen,
  sortMode,
  visibleEdgeRelations,
}: PlaygroundGeneratedOutputHeaderProps): ReactElement {
  const contextMenuItems = useContextMenuItems({
    generatedView,
    canCollapseDirectories,
    canExpandDirectories,
    directoryCount,
    hasCollapsedFiles,
    hasExpandedFiles,
    hasSelection,
    onClearSelection,
    onCollapseAll,
    onCollapseAllDirectories,
    onExpandAllDirectories,
    onExpandAll,
  });

  const toolbarButtons = useToolbarButtons();

  const hasToShowSortToolbar = generatedView === 'list';
  const hasToShowDirectoryCount = generatedView === 'graph'
    || sortMode === 'filename';
  const hasToShowSourceToggle = !sourceOpen;
  const hasVisibleEdgeLegend = generatedView === 'graph'
    && visibleEdgeRelations.length > 0;
  const renderedEdgeLegend = hasVisibleEdgeLegend && (
    <>
      <Divider
        flexItem
        orientation="vertical"
      />
      <EdgeTypeLegend relations={visibleEdgeRelations} />
    </>
  );

  const renderedSortToolbar = hasToShowSortToolbar && (
    <PlaygroundGeneratedOutputSortToolbar
      onChange={onSortModeChange}
      value={sortMode}
    />
  );

  const renderedAfterTitle = (
    <Stack
      alignItems="center"
      direction="row"
      spacing={1}
    >
      <GeneratedOutputCounts
        directoryCount={directoryCount}
        fileCount={fileCount}
        showDirectoryCount={hasToShowDirectoryCount}
      />
      {renderedEdgeLegend}
    </Stack>
  );

  return (
    <PanelHeader
      contextMenuItems={contextMenuItems}
      actions={(
        <>
          {renderedSortToolbar}
          <PanelHeaderToolbar
            ariaLabel="Generated output view"
            onChange={onGeneratedViewChange}
            options={toolbarButtons}
            value={generatedView}
          />
          <PanelToggle
            isOpen={detailsOpen}
            isVisible
            onToggle={onToggleDetails}
            position="right"
            title="details"
          />
        </>
      )}
      afterTitle={renderedAfterTitle}
      hideHeading
      leading={(
        <PanelToggle
          isOpen={sourceOpen}
          isVisible={hasToShowSourceToggle}
          onToggle={onShowSource}
          position="left"
          title="source schema"
        />
      )}
      title="Generated output"
    />
  );
}
