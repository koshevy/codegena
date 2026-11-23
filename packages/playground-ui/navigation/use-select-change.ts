import type {
  GraphPayload,
  GraphPayloadGroupNode,
  GraphPayloadNode,
} from '@codegena/graph-core';
import {
  getSortedFileItems,
  sortGraphPayloadFilesByName,
} from '@codegena/playground-ui/graph-utils';
import type { GeneratedFileSortMode } from '@codegena/playground-ui/preferences';
import { useCallback } from 'react';

import { getRetainedImplicitFileIds } from './get-retained-implicit-file-ids';
import type { PlaygroundNavigationState } from './use-playground-navigation-state';

function getFirstDirectoryFileId(
  graph: GraphPayload,
  directoryId: string,
): string | undefined {
  const directFiles = graph.nodes.filter((node): node is GraphPayloadGroupNode => (
    node.data.kind === 'group'
    && node.parentId === directoryId
  ));

  return sortGraphPayloadFilesByName(directFiles)[0]?.id;
}

interface SelectChangeOptions {
  graph: GraphPayload;
  onNodeVisited: (node: GraphPayloadNode) => void;
  showBothPanels: () => void;
  sortMode: GeneratedFileSortMode;
  state: PlaygroundNavigationState;
}

export function useSelectChange({
  graph,
  onNodeVisited,
  showBothPanels,
  sortMode,
  state,
}: SelectChangeOptions): (
  ids: string[],
  selectedNodeId?: string,
  shouldRevealFile?: boolean,
  explicitIds?: string[],
) => void {
  const {
    hasOpenedPanelsOnSelectionRef,
    implicitSelectedNodeIds,
    latestWarningFocusRef,
    setExplicitSelectedNodeIds,
    setFocusedFileId,
    setFocusedWarning,
    setFocusRevision,
    setImplicitSelectedNodeIds,
    setNavigationTarget,
    setSelectedGeneratedLine,
    setSelectedNodeIds,
  } = state;

  return useCallback((
    ids,
    selectedNodeId,
    shouldRevealFile = false,
    explicitIds = ids,
  ): void => {
    const warningFocusAtSelection = latestWarningFocusRef.current;
    const selectedNode = graph.nodes.find(({ id }) => id === selectedNodeId);

    if (selectedNode) {
      onNodeVisited(selectedNode);
    }

    setTimeout(() => {
      const latestWarningFocus = latestWarningFocusRef.current;
      const newerWarningFocus = latestWarningFocus !== warningFocusAtSelection
        ? latestWarningFocus
        : undefined;

      const retainedFileIds = getRetainedImplicitFileIds(
        graph.nodes,
        implicitSelectedNodeIds,
        explicitIds,
      );

      setSelectedNodeIds([
        ...ids,
        ...retainedFileIds.filter((id) => !ids.includes(id)),
      ]);
      setExplicitSelectedNodeIds(explicitIds);
      setSelectedGeneratedLine(undefined);
      setImplicitSelectedNodeIds(retainedFileIds);
      setFocusedWarning(newerWarningFocus);
      setFocusedFileId(undefined);

      if (!newerWarningFocus) {
        latestWarningFocusRef.current = undefined;
      }

      if (selectedNodeId && !hasOpenedPanelsOnSelectionRef.current) {
        hasOpenedPanelsOnSelectionRef.current = true;
        showBothPanels();
      }

      if (shouldRevealFile && selectedNode && !newerWarningFocus) {
        const selectedFileId = selectedNode.data.kind === 'item'
          ? selectedNode.parentId
          : selectedNode.id;

        const fileId = selectedNode.data.kind === 'directory'
          ? getFirstDirectoryFileId(graph, selectedNode.id)
          : selectedFileId;

        setFocusRevision((current) => current + 1);
        setFocusedFileId(fileId);
      }

      const targetNode = selectedNode?.data.kind === 'group'
        ? getSortedFileItems(graph, selectedNode.id, sortMode)[0]
        : selectedNode;

      if (targetNode?.data.kind === 'item') {
        setNavigationTarget({ ...targetNode.data.sourceLocation });
      }
    });
  }, [
    graph,
    hasOpenedPanelsOnSelectionRef,
    implicitSelectedNodeIds,
    latestWarningFocusRef,
    onNodeVisited,
    setExplicitSelectedNodeIds,
    setFocusedFileId,
    setFocusedWarning,
    setFocusRevision,
    setImplicitSelectedNodeIds,
    setNavigationTarget,
    setSelectedGeneratedLine,
    setSelectedNodeIds,
    showBothPanels,
    sortMode,
  ]);
}
