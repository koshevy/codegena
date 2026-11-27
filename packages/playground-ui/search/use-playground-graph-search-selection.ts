import {
  type GraphPayload,
  getGraphSelectionState,
} from '@codegena/graph-core';
import type { SearchAutocompleteItem } from '@codegena/graph-search-ui';
import { useCallback } from 'react';

interface PlaygroundGraphSearchSelectionOptions {
  graph: GraphPayload;
  onNavigateToSource: (
    location: NonNullable<SearchAutocompleteItem['sourceLocation']>,
    declarationId?: string,
    generatedLine?: number,
  ) => void;
  onRevealWarning: (log: GraphPayload['logs'][number]) => void;
  onSelectChange: (
    ids: string[],
    selectedNodeId?: string,
    shouldRevealFile?: boolean,
    explicitIds?: string[],
  ) => void;
  setDetailsScope: (scope: 'all' | 'selected') => void;
  showBothPanels: () => void;
}

export function usePlaygroundGraphSearchSelection({
  graph,
  onNavigateToSource,
  onRevealWarning,
  onSelectChange,
  setDetailsScope,
  showBothPanels,
}: PlaygroundGraphSearchSelectionOptions): (
  item: SearchAutocompleteItem,
) => void {
  return useCallback((item): void => {
    showBothPanels();

    const node = item.nodeId
      ? graph.nodes.find(({ id }) => id === item.nodeId)
      : undefined;

    if (item.kind === 'warning') {
      const index = Number(item.id.slice('warning:'.length));
      const log = graph.logs[index];

      if (log) {
        onRevealWarning(log);
      }
    }

    if (!node) {
      if (item.sourceLocation) {
        onNavigateToSource(item.sourceLocation);
      }

      return;
    }

    setDetailsScope('selected');

    if (node.data.kind === 'item') {
      const generatedLine = item.kind === 'declaration'
        ? item.snippet?.activeLineNumber
        : undefined;

      onNavigateToSource(node.data.sourceLocation, node.id, generatedLine);
      return;
    }

    const activeIds = getGraphSelectionState(
      graph,
      new Set([node.id]),
    ).activeNodeIds;

    onSelectChange([...activeIds], node.id, true, [node.id]);

    if (item.sourceLocation) {
      onNavigateToSource(item.sourceLocation);
    }
  }, [
    graph,
    onNavigateToSource,
    onRevealWarning,
    onSelectChange,
    setDetailsScope,
    showBothPanels,
  ]);
}
