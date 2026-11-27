import type { GraphPayload } from '../graph-payload';

export interface DirectedSelectionPaths {
  implicitNodeIds: Set<string>;
  edgeIds: Set<string>;
}

function getReachableNodeIds(
  startId: string,
  adjacentNodeIds: ReadonlyMap<string, string[]>,
): Set<string> {
  const reachableIds = new Set<string>();
  const pendingIds = [startId];

  // An explicit stack handles cyclic graphs without recursive call growth.
  while (pendingIds.length > 0) {
    const currentId = pendingIds.pop();

    if (currentId === undefined || reachableIds.has(currentId)) {
      continue;
    }

    reachableIds.add(currentId);
    pendingIds.push(...(adjacentNodeIds.get(currentId) ?? []));
  }

  return reachableIds;
}

/**
 * Finds nodes and edges on directed paths between user-selected nodes.
 *
 * @param graph - Graph containing import, placement, and reference relationships.
 * @param selectedNodeIds - Explicitly selected nodes and their file counterparts.
 * @param explicitlySelectedIds - Node IDs selected directly by the user.
 * @returns Implicit nodes and edges connecting the selected nodes.
 */
export function getDirectedSelectionPaths(
  graph: GraphPayload,
  selectedNodeIds: ReadonlySet<string>,
  explicitlySelectedIds: ReadonlySet<string>,
): DirectedSelectionPaths {
  const implicitNodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  if (explicitlySelectedIds.size < 2) {
    return { implicitNodeIds, edgeIds };
  }

  const graphNodeIds = new Set(graph.nodes.map(({ id }) => id));
  const selectedAnchors = [...graphNodeIds.intersection(selectedNodeIds)];

  if (selectedAnchors.length < 2) {
    return { implicitNodeIds, edgeIds };
  }

  const outgoingNodeIds = new Map<string, string[]>();
  const incomingNodeIds = new Map<string, string[]>();

  const graphEdges = graph.edges.filter(({ source, target }) => (
    graphNodeIds.has(source)
    && graphNodeIds.has(target)
  ));

  const soleItemIdsByGroup = new Map<string, string | null>();

  graph.nodes.forEach((node) => {
    if (node.data.kind !== 'item' || !('parentId' in node) || !node.parentId) {
      return;
    }

    soleItemIdsByGroup.set(
      node.parentId,
      soleItemIdsByGroup.has(node.parentId) ? null : node.id,
    );
  });

  const virtualImportEdges = graphEdges.flatMap((edge) => {
    if (edge.data.relation !== 'import') {
      return [];
    }

    const sourceItemId = soleItemIdsByGroup.get(edge.source);
    const targetItemId = soleItemIdsByGroup.get(edge.target);

    if (!sourceItemId || !targetItemId) {
      return [];
    }

    // Traverse the contained datatypes, but activate the existing import edge.
    return [{
      ...edge,
      source: sourceItemId,
      target: targetItemId,
    }];
  });

  const traversalEdges = [...graphEdges, ...virtualImportEdges];

  traversalEdges.forEach((edge) => {
    const outgoing = outgoingNodeIds.get(edge.source) ?? [];
    const incoming = incomingNodeIds.get(edge.target) ?? [];

    outgoing.push(edge.target);
    incoming.push(edge.source);
    outgoingNodeIds.set(edge.source, outgoing);
    incomingNodeIds.set(edge.target, incoming);
  });

  const reachingEachAnchor = new Map(selectedAnchors.map((targetId) => [
    targetId,
    getReachableNodeIds(targetId, incomingNodeIds),
  ]));

  selectedAnchors.forEach((sourceId) => {
    const reachableFromSource = getReachableNodeIds(sourceId, outgoingNodeIds);

    selectedAnchors.forEach((targetId) => {
      if (sourceId === targetId || !reachableFromSource.has(targetId)) {
        return;
      }

      const reachingTarget = reachingEachAnchor.get(targetId);

      if (!reachingTarget) {
        return;
      }

      traversalEdges.forEach((edge) => {
        if (!reachableFromSource.has(edge.source)
          || !reachingTarget.has(edge.target)) {
          return;
        }

        edgeIds.add(edge.id);
        implicitNodeIds.add(edge.source);
        implicitNodeIds.add(edge.target);
      });
    });
  });

  selectedNodeIds.forEach((selectedId) => {
    implicitNodeIds.delete(selectedId);
  });

  return { implicitNodeIds, edgeIds };
}
