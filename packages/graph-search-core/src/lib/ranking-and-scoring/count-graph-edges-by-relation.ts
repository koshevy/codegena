import type { GraphPayloadEdge } from '@codegena/graph-core';

export interface GraphEdgeCounts {
  import: Map<string, number>;
  reference: Map<string, number>;
}

export function countGraphEdgesByRelation(
  edges: GraphPayloadEdge[],
): GraphEdgeCounts {
  return edges.reduce<GraphEdgeCounts>((counts, { data, source, target }) => {
    if (data.relation === 'placement') {
      return counts;
    }

    const relationCounts = counts[data.relation];

    relationCounts.set(source, (relationCounts.get(source) ?? 0) + 1);
    relationCounts.set(target, (relationCounts.get(target) ?? 0) + 1);

    return counts;
  }, {
    import: new Map<string, number>(),
    reference: new Map<string, number>(),
  });
}
