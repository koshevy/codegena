import type { GraphPayload } from '@codegena/graph-core';
import {
  GraphPayloadMiniSearch,
  type GraphPayloadMiniSearchOptions,
  type VisitHistory,
} from '@codegena/graph-search-core';
import { useMemo } from 'react';

/**
 * Cache one graph index while its immutable inputs keep their identity.
 */
export function useGraphPayloadMiniSearch(
  graphPayload: GraphPayload,
  visitHistory: VisitHistory | undefined,
  options: GraphPayloadMiniSearchOptions,
): GraphPayloadMiniSearch | undefined {
  const index = useMemo(() => (
    visitHistory
      ? new GraphPayloadMiniSearch(graphPayload, visitHistory, options)
      : undefined
  ), [
    graphPayload,
    visitHistory,
    options,
  ]);

  return index;
}
