import type { GraphPayload, GraphPayloadNode } from '@codegena/graph-core';

/**
 * Returns directory ancestors from the root down to a graph node.
 */
export function getAncestorDirectoryIds(
  graph: GraphPayload,
  nodeId: string,
): string[] {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

  const collect = (node: GraphPayloadNode | undefined): string[] => {
    if (!node || !('parentId' in node) || !node.parentId) {
      return [];
    }

    const parent = nodesById.get(node.parentId);

    if (!parent) {
      return [];
    }

    return [
      ...collect(parent),
      ...(parent.data.kind === 'directory' ? [parent.id] : []),
    ];
  };

  return collect(nodesById.get(nodeId));
}
