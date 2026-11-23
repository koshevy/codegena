import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadNode,
} from '@codegena/graph-core';
import { VisitHistory } from '@codegena/graph-search-core';
import { useCallback, useEffect, useMemo } from 'react';

const unsubscribeNoop = (): undefined => undefined;

export function useGraphSearchHistory(
  graph: GraphPayload,
  ownerSpecId: string | undefined,
): {
  getVersion: () => number;
  history: VisitHistory | undefined;
  onLogVisited: (log: GraphPayloadLog) => void;
  onNodeVisited: (node: GraphPayloadNode) => void;
  subscribe: (listener: () => void) => () => void;
} {
  const history = useMemo(() => (
    ownerSpecId
      ? new VisitHistory(graph, ownerSpecId)
      : undefined
  ), [
    graph,
    ownerSpecId,
  ]);

  useEffect(() => {
    history?.start();

    return () => history?.dispose();
  }, [
    history,
  ]);

  const getVersion = useCallback(() => history?.getVersion() ?? 0, [
    history,
  ]);

  const subscribe = useCallback((listener: () => void) => (
    history?.subscribe(listener) ?? unsubscribeNoop
  ), [
    history,
  ]);

  const onLogVisited = useCallback((log: GraphPayloadLog): void => {
    history?.onGraphPayloadLogVisited(log);
  }, [
    history,
  ]);

  const onNodeVisited = useCallback((node: GraphPayloadNode): void => {
    history?.onGraphPayloadNodeVisited(node);
  }, [
    history,
  ]);

  return {
    getVersion,
    history,
    onLogVisited,
    onNodeVisited,
    subscribe,
  };
}
