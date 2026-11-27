import { handleGraphSearchRequest } from './handle-graph-search-request';
import { searchGraph } from '../__mocks__/search-graph';

async function requestSearch(body: unknown): Promise<Response> {
  return handleGraphSearchRequest(new Request('https://codegena.test/api/graph-search', {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  }));
}

describe('Graph search API', () => {
  it('initializes an index and returns ranked declaration results', async () => {
    const sessionId = crypto.randomUUID();
    const initialized = await requestSearch({
      action: 'initialize',
      graphPayload: searchGraph,
      ownerSpecId: 'api-spec',
      sessionId,
    });

    expect(initialized.status).toBe(204);

    const response = await requestSearch({
      action: 'search', query: 'ApiRequest', sessionId,
    });

    expect(response.status).toBe(200);

    const result: unknown = await response.json();

    const declaration = expect.objectContaining({
      kind: 'declaration', title: 'ApiRequest',
    });

    expect(result).toEqual(expect.objectContaining({
      isTruncated: false,
      suggestions: expect.arrayContaining([declaration]),
    }));

    await requestSearch({ action: 'dispose', sessionId });
  });

  it('keeps sessions separate and releases a disposed index', async () => {
    const sessionId = crypto.randomUUID();

    await requestSearch({
      action: 'initialize',
      graphPayload: searchGraph,
      ownerSpecId: 'api-spec',
      sessionId,
    });

    const missing = await requestSearch({
      action: 'search', query: 'ApiRequest', sessionId: 'unknown-session',
    });

    expect(missing.status).toBe(404);

    const completion = await requestSearch({
      action: 'autoSuggest', query: 'ApiReq', sessionId,
    });

    expect(await completion.text()).toContain('apirequest');

    const disposed = await requestSearch({ action: 'dispose', sessionId });
    const afterDisposal = await requestSearch({
      action: 'search', query: 'ApiRequest', sessionId,
    });

    expect(disposed.status).toBe(204);
    expect(afterDisposal.status).toBe(404);
  });

  it('rejects malformed input before creating an index', async () => {
    const invalid = await requestSearch({
      action: 'initialize', graphPayload: { nodes: [{}] }, ownerSpecId: 'api-spec',
      sessionId: crypto.randomUUID(),
    });

    expect(invalid.status).toBe(400);
  });
});
