import type {
  GraphPayloadDirectoryNode,
  GraphPayloadNode,
} from '@codegena/graph-core';
import { useMemo } from 'react';

export function useVisibleDirectories(
  graphNodes: GraphPayloadNode[],
  explicitSelectedNodeIds: string[],
  shouldShowAllFiles: boolean,
): GraphPayloadDirectoryNode[] {
  return useMemo(() => {
    if (shouldShowAllFiles) {
      return [];
    }

    const selectedIds = new Set(explicitSelectedNodeIds);

    return graphNodes
      .filter((node): node is GraphPayloadDirectoryNode => (
        node.data.kind === 'directory'
        && node.parentId !== undefined
        && selectedIds.has(node.parentId)
      ))
      .toSorted((first, second) => (
        first.data.label.localeCompare(second.data.label)
      ));
  }, [
    explicitSelectedNodeIds,
    graphNodes,
    shouldShowAllFiles,
  ]);
}
