import type { GraphPayload, GraphPayloadItemNode } from '@codegena/graph-core';
import type { GeneratedFileSortMode } from '@codegena/playground-ui/preferences';

import { compareSourceLocations } from './compare-source-locations';

const labelCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
});

export function sortFileItems(
  items: GraphPayloadItemNode[],
  sortMode: GeneratedFileSortMode,
): GraphPayloadItemNode[] {
  return items.toSorted((first, second) => {
    if (sortMode === 'filename') {
      return labelCollator.compare(first.data.label, second.data.label);
    }

    const sourceOrder = compareSourceLocations(
      first.data.sourceLocation,
      second.data.sourceLocation,
    );

    return sourceOrder || labelCollator.compare(first.data.label, second.data.label);
  });
}

export function getSortedFileItems(
  graph: GraphPayload,
  fileId: string,
  sortMode: GeneratedFileSortMode,
): GraphPayloadItemNode[] {
  const items = graph.nodes.filter((node): node is GraphPayloadItemNode => (
    node.data.kind === 'item'
    && 'parentId' in node
    && node.parentId === fileId
  ));

  return sortFileItems(items, sortMode);
}
