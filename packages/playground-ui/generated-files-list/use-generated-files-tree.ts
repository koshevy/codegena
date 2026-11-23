import type {
  GraphPayloadGroupNode,
  GraphPayloadDirectoryNode,
  GraphPayloadItemNode,
  GraphPayloadLog,
  GraphPayloadNode,
} from '@codegena/graph-core';
import {
  getWarningLog,
  sortGraphPayloadNodesBy,
} from '@codegena/playground-ui/graph-utils';
import type { GeneratedFileSortMode } from '@codegena/playground-ui/preferences';
import { useMemo } from 'react';

export interface GeneratedFilesTreeGroup {
  kind: 'file';
  group: GraphPayloadGroupNode;
  items: GraphPayloadItemNode[];
  warning?: GraphPayloadLog;
}

export interface GeneratedFilesTreeDirectory {
  children: GeneratedFilesTreeEntry[];
  directory: GraphPayloadDirectoryNode;
  kind: 'directory';
}

export type GeneratedFilesTreeEntry = (
  GeneratedFilesTreeDirectory | GeneratedFilesTreeGroup
);

export function useGeneratedFilesTree(
  graphNodes: GraphPayloadNode[],
  sortMode: GeneratedFileSortMode,
): GeneratedFilesTreeEntry[] {
  return useMemo(() => {
    const sortedNodes = sortGraphPayloadNodesBy(graphNodes, sortMode);
    const groups = sortedNodes.filter(
      (node): node is GraphPayloadGroupNode => node.data.kind === 'group',
    );

    const sortedItems = sortedNodes.filter(
      (node): node is GraphPayloadItemNode => node.data.kind === 'item',
    );

    const itemsByGroup = Map.groupBy(sortedItems, ({ parentId }) => parentId);
    const files = groups.map((group): GeneratedFilesTreeGroup => {
      const items = itemsByGroup.get(group.id) ?? [];

      return {
        group,
        items,
        kind: 'file',
        warning: getWarningLog(items.flatMap(({ data }) => data.logs)),
      };
    });

    if (sortMode === 'source') {
      return files;
    }

    const groupsByDirectory = Map.groupBy(files, ({ group }) => (
      group.parentId ?? '.'
    ));

    const directories = graphNodes.filter((node): node is GraphPayloadDirectoryNode => (
      node.data.kind === 'directory' && node.id !== '.'
    ));

    const directoriesByParent = Map.groupBy(directories, ({ parentId }) => (
      parentId ?? '.'
    ));

    function createEntries(parentId: string): GeneratedFilesTreeEntry[] {
      const nestedDirectories = (directoriesByParent.get(parentId) ?? [])
        .toSorted((first, second) => first.data.label.localeCompare(second.data.label))
        .map((directory): GeneratedFilesTreeDirectory => ({
          children: createEntries(directory.id),
          directory,
          kind: 'directory',
        }));

      return [...nestedDirectories, ...(groupsByDirectory.get(parentId) ?? [])];
    }

    return createEntries('.');
  }, [
    graphNodes,
    sortMode,
  ]);
}
