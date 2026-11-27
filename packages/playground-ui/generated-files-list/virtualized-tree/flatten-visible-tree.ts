import type { GraphPayloadItemNode } from '@codegena/graph-core';

import type {
  GeneratedFilesTreeDirectory,
  GeneratedFilesTreeEntry,
  GeneratedFilesTreeGroup,
} from '../use-generated-files-tree';

export interface VirtualDirectoryRow {
  depth: number;
  entry: GeneratedFilesTreeDirectory;
  kind: 'directory';
  parentId?: string;
}

export interface VirtualFileRow {
  depth: number;
  entry: GeneratedFilesTreeGroup;
  kind: 'file';
  parentId?: string;
}

export interface VirtualDeclarationRow {
  depth: number;
  item: GraphPayloadItemNode;
  kind: 'declaration';
  parentId: string;
}

export type VirtualTreeRow = (
  VirtualDirectoryRow | VirtualFileRow | VirtualDeclarationRow
);

export function flattenVisibleTree(
  entries: GeneratedFilesTreeEntry[],
  expandedItems: string[],
  depth = 0,
  parentId?: string,
): VirtualTreeRow[] {
  return entries.flatMap((entry): VirtualTreeRow[] => {
    if (entry.kind === 'directory') {
      const directoryRow: VirtualDirectoryRow = {
        depth,
        entry,
        kind: 'directory',
        parentId,
      };

      const directoryChildRows = expandedItems.includes(entry.directory.id)
        ? flattenVisibleTree(entry.children, expandedItems, depth + 1, entry.directory.id)
        : [];

      return [directoryRow, ...directoryChildRows];
    }

    const fileRow: VirtualFileRow = {
      depth,
      entry,
      kind: 'file',
      parentId,
    };

    const childRows: VirtualDeclarationRow[] = expandedItems.includes(entry.group.id)
      ? entry.items.map((item) => ({
          depth: depth + 1,
          item,
          kind: 'declaration',
          parentId: entry.group.id,
        }))
      : [];

    return [fileRow, ...childRows];
  });
}

export function getVirtualTreeRowId(row: VirtualTreeRow): string {
  if (row.kind === 'directory') {
    return row.entry.directory.id;
  }

  return row.kind === 'file' ? row.entry.group.id : row.item.id;
}
