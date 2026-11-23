import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { Background, BackgroundVariant, Controls, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import clsx from 'clsx';
import {
  type MouseEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { CodegenaGraphViewHeader } from './codegena-graph-view-header';
import { CodegenaGraphViewSkeleton } from './codegena-graph-view-skeleton';
import type { CodegenaGraphViewProps } from './codegena-graph-view.props';
import {
  codegenaGraphViewClasses,
  CodegenaGraphViewStyles,
} from './codegena-graph-view.styles';
import { DatatypeNode } from './datatype-node';
import { DirectoryNode } from './directory-node';
import { FileNode } from './file-node';
import {
  useFocusGraphNodeAfterLayout,
  useFitViewAfterBulkDirectoryChange,
  useFlowEdges,
  useFlowNodes,
  usePreserveGraphScreenPosition,
  useVisibleGraphEdges,
} from './flow-elements';
import {
  useGraphContextMenu,
  useGraphNodeClick,
  useGraphNodeKeyDown,
} from './graph-interactions';
import {
  useGraphSelectionState,
  useRevealGraphNode,
  useUpdateGraphSelection,
} from './graph-selection';
import { useExpandedDirectoryIds } from './use-expanded-directory-ids';

const nodeTypes = {
  datatype: DatatypeNode,
  directory: DirectoryNode,
  file: FileNode,
};

const emptySelectedNodeIds: string[] = [];

export function CodegenaGraphView({
  fitViewRevision = 0,
  defaultSelectedNodeIds = emptySelectedNodeIds,
  embedded = false,
  expandedDirectoryIds: controlledExpandedDirectoryIds,
  graph,
  height = 720,
  implicitSelectedNodeIds = emptySelectedNodeIds,
  isActive = true,
  onDeclarationGlyphClick,
  onSelectChange,
  onExpandedDirectoryIdsChange,
  onNodeContextMenu,
  onPaneContextMenu,
  onVisibleEdgeRelationsChange,
  onWarningClick,
  title = 'Schema relationships',
}: CodegenaGraphViewProps): ReactElement {
  const theme = useTheme();
  const [expandedDirectoryIds, setExpandedDirectoryIds] = useExpandedDirectoryIds(
    controlledExpandedDirectoryIds,
    onExpandedDirectoryIdsChange,
  );
  const toggledDirectoryIdRef = useRef<string | null>(null);
  const pendingRevealedNodeIdRef = useRef<string | null>(null);
  const fitViewAfterBulkChangeRef = useFitViewAfterBulkDirectoryChange(
    fitViewRevision,
    expandedDirectoryIds,
  );

  const toggleDirectory = useCallback((directoryId: string): void => {
    if (directoryId === '.') {
      return;
    }

    pendingRevealedNodeIdRef.current = null;
    toggledDirectoryIdRef.current = directoryId;
    setExpandedDirectoryIds((current) => {
      if (!current.has(directoryId)) {
        return new Set([...current, directoryId]);
      }

      return new Set([...current].filter((id) => (
        id !== directoryId
        && !id.startsWith(`${directoryId}/`)
      )));
    });
  }, [setExpandedDirectoryIds]);

  const {
    explicitlySelectedIds,
    handleGraphInit,
    recordLocalSelection,
    setExplicitlySelectedIds,
  } = useRevealGraphNode({
    defaultSelectedNodeIds,
    expandedDirectoryIds,
    graph,
    isActive,
    pendingRevealedNodeIdRef,
    setExpandedDirectoryIds,
  });

  const {
    activeNodeIds,
    directedSelectionPaths,
    implicitlySelectedIds,
    selectedNodeIds,
  } = useGraphSelectionState(
    graph,
    explicitlySelectedIds,
    implicitSelectedNodeIds,
  );

  const {
    isCurrentLayoutReady,
    isLayoutReady,
    nodes,
  } = useFlowNodes(
    graph,
    expandedDirectoryIds,
    explicitlySelectedIds,
    implicitlySelectedIds,
    toggleDirectory,
  );

  const handleGraphInitWithFocus = useFocusGraphNodeAfterLayout({
    fitViewRevision,
    fitViewAfterBulkChangeRef,
    isActive,
    isCurrentLayoutReady,
    nodes,
    onGraphInit: handleGraphInit,
    pendingRevealedNodeIdRef,
    toggledDirectoryIdRef,
  });

  const {
    canvasRef,
    handleGraphInit: handleGraphInitWithStablePosition,
  } = usePreserveGraphScreenPosition(handleGraphInitWithFocus);

  const {
    edges: visibleEdges,
    relations: visibleEdgeRelations,
  } = useVisibleGraphEdges(graph.edges, nodes);

  useEffect(() => {
    onVisibleEdgeRelationsChange?.(visibleEdgeRelations);
  }, [
    onVisibleEdgeRelationsChange,
    visibleEdgeRelations,
  ]);

  const edges = useFlowEdges({
    directedPathEdgeIds: directedSelectionPaths.edgeIds,
    edges: visibleEdges,
    explicitlySelectedIds,
    selectedNodeIds,
    theme,
  });

  const {
    datatypeCount,
    fileCount,
  } = useMemo(() => ({
    datatypeCount: graph.nodes.filter(({ data }) => data.kind === 'item').length,
    fileCount: graph.nodes.filter(({ data }) => data.kind === 'group').length,
  }), [
    graph.nodes,
  ]);

  const updateSelection = useUpdateGraphSelection(
    graph,
    explicitlySelectedIds,
    setExplicitlySelectedIds,
    recordLocalSelection,
    onSelectChange,
  );

  const handleNodeKeyDown = useGraphNodeKeyDown(
    graph,
    explicitlySelectedIds,
    updateSelection,
  );

  const handleNodeClick = useGraphNodeClick({
    activeNodeIds,
    explicitlySelectedIds,
    graph,
    onDeclarationGlyphClick,
    onWarningClick,
    updateSelection,
  });

  const clearSelection = useCallback(() => {
    updateSelection(new Set());
  }, [updateSelection]);

  const handlePaneClick = useCallback((event: MouseEvent): void => {
    if (event.button === 0) {
      clearSelection();
    }
  }, [clearSelection]);

  const {
    handleFlowNodeContextMenu,
    handlePaneContextMenu,
  } = useGraphContextMenu({
    expandedDirectoryIds,
    explicitlySelectedIds,
    graph,
    onNodeContextMenu,
    onPaneContextMenu,
    onWarningClick,
    selectedNodeIds,
    toggleDirectory,
    updateSelection,
  });

  const renderedHeader = !embedded && (
    <CodegenaGraphViewHeader
      datatypeCount={datatypeCount}
      fileCount={fileCount}
      title={title}
    />
  );

  const renderedFlow = isLayoutReady && (
    <ReactFlow
      zoomOnDoubleClick={false}
      edgesFocusable={false}
      edges={edges}
      elementsSelectable={false}
      fitView
      fitViewOptions={{ maxZoom: 1, padding: 0.18 }}
      maxZoom={1}
      minZoom={0.3}
      nodes={nodes}
      nodesConnectable={false}
      nodesDraggable={false}
      nodesFocusable
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      onNodeContextMenu={handleFlowNodeContextMenu}
      onInit={handleGraphInitWithStablePosition}
      onPaneClick={handlePaneClick}
      onPaneContextMenu={handlePaneContextMenu}
      selectionKeyCode={null}
      zIndexMode="manual"
    >
      <Background
        color={alpha(theme.palette.divider, 0.8)}
        gap={28}
        size={4}
        variant={BackgroundVariant.Dots}
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
  const renderedSkeleton = isActive && !isLayoutReady && <CodegenaGraphViewSkeleton />;

  return (
    <CodegenaGraphViewStyles
      className={clsx({
        [codegenaGraphViewClasses.root]: true,
        [codegenaGraphViewClasses.embedded]: embedded,
      })}
      elevation={0}
      onKeyDownCapture={handleNodeKeyDown}
      sx={{ height }}
    >
      {renderedHeader}
      <Box
        aria-busy={!isCurrentLayoutReady}
        className={codegenaGraphViewClasses.canvas}
        ref={canvasRef}
      >
        {renderedSkeleton}
        {renderedFlow}
      </Box>
    </CodegenaGraphViewStyles>
  );
}
