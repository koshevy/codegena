import type {
  GraphPayloadGroupNode,
  GraphPayloadItemNode,
  GraphPayloadNode,
  GraphPayloadDirectoryNode,
} from '@codegena/graph-core';
import type { GeneratedFileSortMode } from '@codegena/playground-ui/preferences';

import { compareSourceLocations } from './compare-source-locations';
import { sortFileItems } from './get-sorted-file-items';

export function sortGraphPayloadNodesBy(
  nodes: GraphPayloadNode[],
  sortType: GeneratedFileSortMode,
): GraphPayloadNode[] {
  const directories = nodes.filter((node): node is GraphPayloadDirectoryNode => (
    node.data.kind === 'directory'
  ));

  const groups = nodes.filter((node): node is GraphPayloadGroupNode => (
    node.data.kind === 'group'
  ));
  const items = sortFileItems(
    nodes.filter((node): node is GraphPayloadItemNode => node.data.kind === 'item'),
    sortType,
  );

  const firstItemByGroup = new Map<string, GraphPayloadItemNode>();

  items.forEach((item) => {
    if (!firstItemByGroup.has(item.parentId)) {
      firstItemByGroup.set(item.parentId, item);
    }
  });

  groups.sort((first, second) => {
    const filenameOrder = first.data.fileName.localeCompare(
      second.data.fileName,
      undefined,
      { sensitivity: 'base' },
    );

    if (sortType === 'filename') {
      return filenameOrder;
    }

    const firstItem = firstItemByGroup.get(first.id);
    const secondItem = firstItemByGroup.get(second.id);

    if (firstItem && !secondItem) {
      return -1;
    }

    if (!firstItem && secondItem) {
      return 1;
    }

    if (!firstItem || !secondItem) {
      return filenameOrder;
    }

    return compareSourceLocations(
      firstItem.data.sourceLocation,
      secondItem.data.sourceLocation,
    ) || filenameOrder;
  });

  return [
    ...directories,
    ...groups,
    ...items,
  ];
}
