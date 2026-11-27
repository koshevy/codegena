import { graphSearchRequestSchema } from '@codegena/graph-search-core';

import {
  disposeSearchSession,
  getSearchSession,
  initializeSearchSession,
} from './search-sessions';

/**
 * Search-specific HTTP operations. Worker routing and transport belong to PWA.
 */
export async function handleGraphSearchRequest(request: Request): Promise<Response> {
  let value: unknown;

  try {
    value = await request.json();
  }
  catch {
    return Response.json({ error: 'Invalid search request JSON.' }, { status: 400 });
  }

  const parsed = graphSearchRequestSchema.safeParse(value);

  if (!parsed.success) {
    return Response.json({ error: 'Invalid search request.' }, { status: 400 });
  }

  const operation = parsed.data;

  if (operation.action === 'initialize') {
    initializeSearchSession(operation);

    return new Response(null, { status: 204 });
  }

  if (operation.action === 'dispose') {
    disposeSearchSession(operation.sessionId);

    return new Response(null, { status: 204 });
  }

  const session = getSearchSession(operation.sessionId);

  if (!session) {
    return Response.json({ error: 'Search session not found.' }, { status: 404 });
  }

  if (operation.action === 'autoSuggest') {
    return new Response(session.search.getAutoSuggestion(operation.query));
  }

  return Response.json(session.search.getSearchSuggestions(operation.query));
}
