import type { GraphPayloadGroupNode, GraphPayloadNode } from '@codegena/graph-core';
import { sortGraphPayloadFilesByName } from '@codegena/playground-ui/graph-utils';
import { useMemo } from 'react';

interface VisibleFilesResult {
  selectedFileIds: ReadonlySet<string>;
  visibleFileIds: ReadonlySet<string>;
  visibleFiles: GraphPayloadGroupNode[];
}

export function useVisibleFiles(
  graphNodes: GraphPayloadNode[],
  selectedNodeIds: string[],
  shouldShowAllFiles: boolean,
): VisibleFilesResult {
  const allFiles = useMemo(() => sortGraphPayloadFilesByName(
    graphNodes.filter((node): node is GraphPayloadGroupNode => (
      node.data.kind === 'group'
    )),
  ), [graphNodes]);

  const selectedFileIds = useMemo(() => {
    const selectedIds = new Set(selectedNodeIds);

    return new Set(graphNodes
      .filter(({ id }) => selectedIds.has(id))
      .flatMap((node) => {
        if (node.data.kind === 'item' && 'parentId' in node && node.parentId) {
          return [node.parentId];
        }

        return node.data.kind === 'group' ? [node.id] : [];
      }));
  }, [
    graphNodes,
    selectedNodeIds,
  ]);

  const visibleFiles = useMemo(() => {
    if (shouldShowAllFiles) {
      return allFiles;
    }

    return allFiles.filter(({ id }) => selectedFileIds.has(id));
  }, [
    allFiles,
    selectedFileIds,
    shouldShowAllFiles,
  ]);

  const visibleFileIds = useMemo(
    () => new Set(visibleFiles.map(({ id }) => id)),
    [visibleFiles],
  );

  return { selectedFileIds, visibleFileIds, visibleFiles };
}
