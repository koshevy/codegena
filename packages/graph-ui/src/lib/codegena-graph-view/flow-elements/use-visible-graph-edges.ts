import type {
  GraphPayloadEdge,
  GraphPayloadEdgeRelation,
} from '@codegena/graph-core';
import type { Node } from '@xyflow/react';
import { useMemo } from 'react';

interface VisibleGraphEdges {
  edges: GraphPayloadEdge[];
  relations: GraphPayloadEdgeRelation[];
}

export function useVisibleGraphEdges(
  graphEdges: GraphPayloadEdge[],
  nodes: Node[],
): VisibleGraphEdges {
  return useMemo(() => {
    const visibleNodeIds = new Set(nodes.map(({ id }) => id));
    const edges = graphEdges.filter(({ source, target }) => (
      visibleNodeIds.has(source) && visibleNodeIds.has(target)
    ));
    const relations = [...new Set(edges.map(({ data }) => data.relation))];

    return { edges, relations };
  }, [
    graphEdges,
    nodes,
  ]);
}
