import { GraphSearchClient } from './graph-search-client';
import { searchGraph } from '../../../__mocks__/search-graph';

const emptyResult = { isTruncated: false, suggestions: [] };

describe('GraphSearchClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initializes once for concurrent queries and releases its session', async () => {
    const send = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(Response.json(emptyResult))
      .mockResolvedValueOnce(new Response('apirequest'))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new GraphSearchClient(searchGraph, 'client-spec');

    const [result, completion] = await Promise.all([
      client.getSearchSuggestions('ApiRequest'),
      client.getAutoSuggestion('ApiReq'),
    ]);

    expect(result).toEqual(emptyResult);
    expect(completion).toBe('apirequest');
    expect(send).toHaveBeenCalledTimes(3);

    await client.dispose();

    const firstBody: unknown = JSON.parse(String(send.mock.calls[0]?.[1]?.body));
    const lastBody: unknown = JSON.parse(String(send.mock.calls[3]?.[1]?.body));

    expect(firstBody).toEqual(expect.objectContaining({ action: 'initialize' }));
    expect(lastBody).toEqual(expect.objectContaining({ action: 'dispose' }));
    await expect(client.getSearchSuggestions()).rejects.toThrow('disposed');
  });

  it('recreates a missing index before repeating the query', async () => {
    const send = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(Response.json(emptyResult))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new GraphSearchClient(searchGraph, 'client-spec');

    await expect(client.getSearchSuggestions()).resolves.toEqual(emptyResult);
    expect(send).toHaveBeenCalledTimes(4);

    await client.dispose();
  });

  it('does not revive a disposed session when a pending query returns 404', async () => {
    const pendingQuery = Promise.withResolvers<Response>();
    const queryStarted = Promise.withResolvers<void>();

    const send = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockImplementationOnce(() => {
        queryStarted.resolve();

        return pendingQuery.promise;
      })
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new GraphSearchClient(searchGraph, 'client-spec');

    await client.initialize();

    const query = client.getSearchSuggestions('ApiRequest');
    const rejectedQuery = expect(query).rejects.toThrow('disposed');

    await queryStarted.promise;
    await client.dispose();
    pendingQuery.resolve(new Response(null, { status: 404 }));
    await rejectedQuery;
    await expect(client.initialize()).rejects.toThrow('disposed');
    expect(send).toHaveBeenCalledTimes(3);
  });

  it('reports an unavailable API and rejects invalid result data', async () => {
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(Response.json({ suggestions: [{}] }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const unavailable = new GraphSearchClient(searchGraph, 'client-spec');

    await expect(unavailable.getSearchSuggestions()).rejects.toThrow('(503)');
    await unavailable.dispose();

    const invalidResult = new GraphSearchClient(searchGraph, 'client-spec');

    await expect(invalidResult.getSearchSuggestions()).rejects.toThrow();
    await invalidResult.dispose();
  });
});
