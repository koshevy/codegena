import {
  GraphPayloadMiniSearch,
  type GraphSearchInitializeRequest,
  VisitHistory,
} from '@codegena/graph-search-core';

interface GraphSearchSession {
  history: VisitHistory;
  search: GraphPayloadMiniSearch;
}

const sessions = new Map<string, GraphSearchSession>();

export function getSearchSession(sessionId: string): GraphSearchSession | undefined {
  return sessions.get(sessionId);
}

export function disposeSearchSession(sessionId: string): void {
  const session = sessions.get(sessionId);

  session?.search.dispose();
  session?.history.dispose();
  sessions.delete(sessionId);
}

export function initializeSearchSession({
  graphPayload,
  options,
  ownerSpecId,
  sessionId,
}: GraphSearchInitializeRequest): void {
  disposeSearchSession(sessionId);

  const history = new VisitHistory(graphPayload, ownerSpecId);
  const search = new GraphPayloadMiniSearch(graphPayload, history, options);

  history.start();
  sessions.set(sessionId, { history, search });
}
