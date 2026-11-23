import type { GraphPayload } from '@codegena/graph-core';
import type {
  GraphPayloadMiniSearchOptions,
  GraphSearchSource,
  VisitHistory,
} from '@codegena/graph-search-core';
import { useCallback, useMemo } from 'react';

import { useGraphPayloadMiniSearch } from './use-graph-payload-mini-search';
import { useGraphSearchClient } from './use-graph-search-client';

export function useGraphSearchSource(
  graph: GraphPayload,
  sourceSchemaText: string,
  ownerSpecId: string | undefined,
  history: VisitHistory | undefined,
): GraphSearchSource {
  const fileName = useMemo(() => {
    const sourceFile = graph.nodes.find(({ data }) => data.kind === 'item');

    return sourceFile?.data.kind === 'item'
      ? sourceFile.data.sourceLocation.fileName
      : 'specification.json';
  }, [
    graph,
  ]);

  const options: GraphPayloadMiniSearchOptions = useMemo(() => ({
    sourceSpecification: {
      fileName,
      text: sourceSchemaText,
    },
  }), [
    fileName,
    sourceSchemaText,
  ]);

  const {
    client,
    failApi,
    shouldUseApi,
  } = useGraphSearchClient(graph, ownerSpecId, options);

  const localIndex = useGraphPayloadMiniSearch(
    graph,
    shouldUseApi ? undefined : history,
    options,
  );

  return useCallback(async (query: string) => {
    if (client) {
      try {
        return await client.getSearchSuggestions(query);
      }
      catch {
        failApi();

        return { isTruncated: false, suggestions: [] };
      }
    }

    return localIndex?.getSearchSuggestions(query) ?? {
      isTruncated: false,
      suggestions: [],
    };
  }, [
    client,
    failApi,
    localIndex,
  ]);
}
