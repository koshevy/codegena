import type { GraphPayload } from '@codegena/graph-core';
import {
  type GraphPayloadMiniSearchOptions,
  GraphSearchClient,
} from '@codegena/graph-search-core';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  type GraphSearchReadiness,
  GraphSearchReadinessContext,
} from './graph-search-readiness-context';

interface SearchApiInputs {
  apiReadiness: Promise<GraphSearchReadiness> | null;
  graph: GraphPayload;
  options: GraphPayloadMiniSearchOptions;
  ownerSpecId: string;
}

interface SearchApiState {
  client?: GraphSearchClient;
  hasFailed: boolean;
  inputs: SearchApiInputs;
}

interface GraphSearchClientState {
  client: GraphSearchClient | undefined;
  failApi: () => void;
  shouldUseApi: boolean;
}

/**
 * Own a virtual HTTP search client while its immutable inputs stay current.
 * Report a query failure with failApi to release it and enable local fallback.
 */
export function useGraphSearchClient(
  graph: GraphPayload,
  ownerSpecId: string | undefined,
  options: GraphPayloadMiniSearchOptions,
): GraphSearchClientState {
  const apiReadiness = useContext(GraphSearchReadinessContext);
  const [apiState, setApiState] = useState<SearchApiState>();

  const inputs = useMemo(() => {
    if (!ownerSpecId) {
      return;
    }

    return {
      apiReadiness,
      graph,
      options,
      ownerSpecId,
    };
  }, [
    apiReadiness,
    graph,
    options,
    ownerSpecId,
  ]);

  const shouldUseApi = apiState?.inputs !== inputs || !apiState?.hasFailed;

  useEffect(() => {
    if (!inputs || !shouldUseApi) {
      return;
    }

    let isCurrent = true;
    let createdClient: GraphSearchClient | undefined;

    const readiness = inputs.apiReadiness ?? Promise.resolve('ready');

    void readiness.then(async (status) => {
      if (!isCurrent) {
        return;
      }

      if (status === 'unavailable') {
        setApiState({ hasFailed: true, inputs });

        return;
      }

      createdClient = new GraphSearchClient(
        inputs.graph,
        inputs.ownerSpecId,
        inputs.options,
      );

      await createdClient.initialize();

      if (isCurrent) {
        setApiState({ client: createdClient, hasFailed: false, inputs });
      }
    }).catch(() => {
      if (isCurrent) {
        setApiState({ hasFailed: true, inputs });
      }
    });

    return () => {
      isCurrent = false;
      void createdClient?.dispose();
    };
  }, [
    inputs,
    shouldUseApi,
  ]);

  const hasCurrentClient = shouldUseApi && apiState?.inputs === inputs;
  const client = hasCurrentClient ? apiState?.client : undefined;

  const failApi = useCallback((): void => {
    setApiState((current) => {
      if (!current || current.client !== client || current.hasFailed) {
        return current;
      }

      return { ...current, hasFailed: true };
    });
  }, [
    client,
  ]);

  return { client, failApi, shouldUseApi };
}
