import type {
  GraphPayloadItemNode,
  GraphPayloadNode,
} from '@codegena/graph-core';

export function getRetainedImplicitFileIds(
  graphNodes: readonly GraphPayloadNode[],
  implicitFileIds: readonly string[],
  explicitNodeIds: readonly string[],
): string[] {
  if (implicitFileIds.length === 0) {
    return [];
  }

  const explicitIds = new Set(explicitNodeIds);
  const selectedParentIds = new Set(graphNodes
    .filter((node): node is GraphPayloadItemNode => (
      node.data.kind === 'item' && explicitIds.has(node.id)
    ))
    .map(({ parentId }) => parentId));

  return implicitFileIds.filter((id) => selectedParentIds.has(id));
}
