import type { GraphPayloadNode } from '@codegena/graph-core';

/** Keeps a node visible only while every containing directory is expanded. */
export function getVisibleGraphNodes(
  nodes: GraphPayloadNode[],
  expandedDirectoryIds: ReadonlySet<string>,
): GraphPayloadNode[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const visibilityById = new Map<string, boolean>();

  function isVisible(node: GraphPayloadNode): boolean {
    const cached = visibilityById.get(node.id);

    if (cached !== undefined) {
      return cached;
    }

    const parent = 'parentId' in node && node.parentId
      ? nodesById.get(node.parentId)
      : undefined;

    const visible = !parent || (
      isVisible(parent)
      && (parent.data.kind !== 'directory' || expandedDirectoryIds.has(parent.id))
    );

    visibilityById.set(node.id, visible);
    return visible;
  }

  return nodes.filter((node) => isVisible(node));
}
