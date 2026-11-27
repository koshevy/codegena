import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadNode,
} from '@codegena/graph-core';
import type { GraphSearchSource } from '@codegena/graph-search-core';

import { useGraphSearchHistory } from './use-graph-search-history';
import { useGraphSearchSource } from './use-graph-search-source';
import { useGraphSearchSpecId } from './use-graph-search-spec-id';

interface GraphSearch {
  getVersion: () => number;
  onLogVisited: (log: GraphPayloadLog) => void;
  onNodeVisited: (node: GraphPayloadNode) => void;
  source: GraphSearchSource;
  subscribe: (listener: () => void) => () => void;
}

export function useGraphSearch(
  graph: GraphPayload,
  sourceSchemaText: string,
): GraphSearch {
  const ownerSpecId = useGraphSearchSpecId(sourceSchemaText);

  const {
    getVersion,
    history,
    onLogVisited,
    onNodeVisited,
    subscribe,
  } = useGraphSearchHistory(graph, ownerSpecId);

  const source = useGraphSearchSource(
    graph,
    sourceSchemaText,
    ownerSpecId,
    history,
  );

  return {
    getVersion,
    onLogVisited,
    onNodeVisited,
    source,
    subscribe,
  };
}
