import type { GraphPayloadEdgeRelation } from '@codegena/graph-core';
import { getVisibleGraphNodes } from '@codegena/graph-ui';
import { PanelBody } from '@codegena/ui-unified/panels';
import { type ReactElement, useCallback, useMemo, useState } from 'react';

import { PlaygroundGeneratedOutputHeader } from './playground-generated-output-header';
import { PlaygroundGeneratedOutputView } from './playground-generated-output-view';
import type { PlaygroundGeneratedOutputProps } from './playground-generated-output.props';

const maximumBulkActionNodeCount = 1000;

export function PlaygroundGeneratedOutput({
  detailsOpen,
  detailsScope,
  generatedView,
  graph,
  implicitSelectedNodeIds,
  onGeneratedViewChange,
  onDeclarationGlyphClick,
  onRevealInSpecification,
  onSelectChange,
  onShowInDetails,
  onShowSource,
  onSortModeChange,
  onToggleDetails,
  onWarningClick,
  selectedNodeIds,
  sortMode,
  sourceOpen,
}: PlaygroundGeneratedOutputProps): ReactElement {
  const [expandedFileIds, setExpandedFileIds] = useState<string[]>([]);
  // A bulk action can repeat without changing the graph's directory IDs.
  const [fitViewRevision, setFitViewRevision] = useState(0);
  const [expandedDirectoryIds, setExpandedDirectoryIds] = useState<Set<string>>(
    () => new Set(['.']),
  );
  const [visibleEdgeRelations, setVisibleEdgeRelations] = useState<
    GraphPayloadEdgeRelation[]
  >([]);

  const handleVisibleEdgeRelationsChange = useCallback((
    relations: GraphPayloadEdgeRelation[],
  ): void => {
    setVisibleEdgeRelations((current) => (
      current.length === relations.length
      && current.every((relation) => relations.includes(relation))
        ? current
        : relations
    ));
  }, []);

  const directoryIds = useMemo(() => new Set(graph.nodes
    .filter(({ data, id }) => data.kind === 'directory' && id !== '.')
    .map(({ id }) => id)), [graph.nodes]);

  const fileGroupIds = useMemo(() => new Set(graph.nodes
    .filter(({ data }) => data.kind === 'group')
    .map(({ id }) => id)), [graph.nodes]);

  const nodeCounts = {
    directoryCount: directoryIds.size,
    fileCount: fileGroupIds.size,
  };
  const canRunBulkActions = nodeCounts.directoryCount
    + nodeCounts.fileCount <= maximumBulkActionNodeCount;

  const visibleGraphNodes = useMemo(() => getVisibleGraphNodes(
    graph.nodes,
    expandedDirectoryIds,
  ), [
    expandedDirectoryIds,
    graph.nodes,
  ]);

  const visibleListNodes = useMemo(() => getVisibleGraphNodes(
    graph.nodes,
    new Set(['.', ...expandedFileIds]),
  ), [
    expandedFileIds,
    graph.nodes,
  ]);

  const collapseAllDirectories = useCallback((): void => {
    setFitViewRevision((current) => current + 1);
    setExpandedDirectoryIds(new Set(['.']));
    setExpandedFileIds((current) => current.filter((id) => (
      !directoryIds.has(id)
    )));
  }, [directoryIds]);

  const expandAllDirectories = useCallback((): void => {
    setFitViewRevision((current) => current + 1);
    setExpandedDirectoryIds(new Set(['.', ...directoryIds]));
    setExpandedFileIds((current) => [...new Set([...current, ...directoryIds])]);
  }, [directoryIds]);

  const collapseAllFiles = useCallback((): void => {
    setExpandedFileIds((current) => current.filter((id) => (
      !fileGroupIds.has(id)
    )));
  }, [fileGroupIds]);

  const expandAllFiles = useCallback((): void => {
    setExpandedFileIds((current) => [...new Set([...current, ...fileGroupIds])]);
  }, [fileGroupIds]);

  const expandedFileIdSet = new Set(expandedFileIds);
  const visibleExpandableListNodes = sortMode === 'filename'
    ? visibleListNodes.filter(({ data }) => data.kind === 'group')
    : graph.nodes.filter(({ data }) => data.kind === 'group');
  const hasCollapsedFiles = canRunBulkActions
    && visibleExpandableListNodes.some(({ id }) => (
      !expandedFileIdSet.has(id)
    ));
  const hasExpandedFiles = canRunBulkActions
    && visibleExpandableListNodes.some(({ id }) => (
      expandedFileIdSet.has(id)
    ));
  const hasSelection = selectedNodeIds.length > 0;
  const canShowDirectoryActions = generatedView === 'graph'
    || sortMode === 'filename';
  const visibleDirectoryNodes = generatedView === 'graph'
    ? visibleGraphNodes
    : visibleListNodes;
  const expandedVisibleDirectories = visibleDirectoryNodes.some(({ data, id }) => (
    data.kind === 'directory'
    && id !== '.'
    && (generatedView === 'graph'
      ? expandedDirectoryIds.has(id)
      : expandedFileIdSet.has(id))
  ));
  const canCollapseDirectories = canRunBulkActions
    && canShowDirectoryActions
    && expandedVisibleDirectories;
  const canExpandDirectories = canRunBulkActions
    && canShowDirectoryActions
    && [...directoryIds].some((id) => (
      generatedView === 'graph'
        ? !expandedDirectoryIds.has(id)
        : !expandedFileIdSet.has(id)
    ));

  const clearSelection = useCallback((): void => {
    onSelectChange([]);
  }, [onSelectChange]);

  return (
    <>
      <PlaygroundGeneratedOutputHeader
        canCollapseDirectories={canCollapseDirectories}
        canExpandDirectories={canExpandDirectories}
        detailsOpen={detailsOpen}
        directoryCount={nodeCounts.directoryCount}
        fileCount={nodeCounts.fileCount}
        hasCollapsedFiles={hasCollapsedFiles}
        hasExpandedFiles={hasExpandedFiles}
        hasSelection={hasSelection}
        generatedView={generatedView}
        onClearSelection={clearSelection}
        onCollapseAll={collapseAllFiles}
        onCollapseAllDirectories={collapseAllDirectories}
        onExpandAllDirectories={expandAllDirectories}
        onExpandAll={expandAllFiles}
        onGeneratedViewChange={onGeneratedViewChange}
        onShowSource={onShowSource}
        onSortModeChange={onSortModeChange}
        onToggleDetails={onToggleDetails}
        sourceOpen={sourceOpen}
        sortMode={sortMode}
        visibleEdgeRelations={visibleEdgeRelations}
      />
      <PanelBody>
        <PlaygroundGeneratedOutputView
          canCollapseDirectories={canCollapseDirectories}
          canExpandDirectories={canExpandDirectories}
          directoryCount={nodeCounts.directoryCount}
          detailsOpen={detailsOpen}
          detailsScope={detailsScope}
          expandedDirectoryIds={expandedDirectoryIds}
          expandedFileIds={expandedFileIds}
          fitViewRevision={fitViewRevision}
          generatedView={generatedView}
          graph={graph}
          hasCollapsedFiles={hasCollapsedFiles}
          hasExpandedFiles={hasExpandedFiles}
          implicitSelectedNodeIds={implicitSelectedNodeIds}
          onCollapseAll={collapseAllFiles}
          onCollapseAllDirectories={collapseAllDirectories}
          onDeclarationGlyphClick={onDeclarationGlyphClick}
          onExpandAllDirectories={expandAllDirectories}
          onExpandAll={expandAllFiles}
          onExpandedFileIdsChange={setExpandedFileIds}
          onExpandedDirectoryIdsChange={setExpandedDirectoryIds}
          onRevealInSpecification={onRevealInSpecification}
          onSelectChange={onSelectChange}
          onShowInDetails={onShowInDetails}
          onVisibleEdgeRelationsChange={handleVisibleEdgeRelationsChange}
          onWarningClick={onWarningClick}
          selectedNodeIds={selectedNodeIds}
          sortMode={sortMode}
          sourceOpen={sourceOpen}
        />
      </PanelBody>
    </>
  );
}
