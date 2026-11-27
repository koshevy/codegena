/**
 * @jest-environment node
 */
import {
  GraphSearchClient,
  type GraphSearchSuggestionsResult,
} from '@codegena/graph-search-core';
import {
  initializeServiceWorker,
  registerServiceWorkerRoute,
} from '@codegena/pwa/service-worker-client';

import { createGithubSearchSource } from './search-suggestions';

jest.mock('@codegena/pwa/service-worker-client', () => ({
  initializeServiceWorker: jest.fn(),
  registerServiceWorkerRoute: jest.fn(),
}));

describe('getGithubSearchSuggestions', () => {
  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('aborts an unfinished graph download when its feature is released', async () => {
    const source = createGithubSearchSource('dev-disposal-test');
    const download = Promise.withResolvers<Response>();
    const started = Promise.withResolvers<AbortSignal>();

    jest.spyOn(globalThis, 'fetch').mockImplementation((_url, options) => {
      const requestSignal = options?.signal;

      if (!requestSignal) {
        throw new Error('The graph download needs a cancellation signal.');
      }

      started.resolve(requestSignal);

      return download.promise;
    });

    const pending = source.getSuggestions('PublicEvent');
    const failure = expect(pending).rejects.toThrow('aborted');
    const signal = await started.promise;

    source.dispose();
    expect(signal?.aborted).toBe(true);
    download.reject(new DOMException('The download was aborted.', 'AbortError'));
    await failure;
  });

  it('recovers a failed load and shares its background client', async () => {
    const { getSuggestions: getGithubSearchSuggestions } = (
      createGithubSearchSource('dev-test')
    );

    const fetchGraph = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ edges: [], logs: [], nodes: [] }));

    const result = { isTruncated: false, suggestions: [] };
    const query = jest.spyOn(GraphSearchClient.prototype, 'getSearchSuggestions')
      .mockResolvedValue(result);

    await expect(getGithubSearchSuggestions('ApiRequest'))
      .rejects.toThrow('could not be loaded');

    await expect(Promise.all([
      getGithubSearchSuggestions('ApiRequest'),
      getGithubSearchSuggestions('CopilotSeatDetails'),
    ])).resolves.toEqual([result, result]);

    expect(fetchGraph).toHaveBeenCalledTimes(2);
    expect(initializeServiceWorker).toHaveBeenCalledTimes(2);
    expect(registerServiceWorkerRoute).toHaveBeenLastCalledWith({
      httpMethod: 'POST',
      moduleUrl: expect.stringMatching(/^\/graph-search-api\.js\?buildId=dev-/),
      routeBaseUrl: '/api/graph-search',
    });
    expect(query.mock.calls).toEqual([['ApiRequest'], ['CopilotSeatDetails']]);

    const delayedFailure = Promise.withResolvers<GraphSearchSuggestionsResult>();
    const dispose = jest.spyOn(GraphSearchClient.prototype, 'dispose')
      .mockResolvedValue();

    query.mockImplementationOnce(() => delayedFailure.promise)
      .mockRejectedValueOnce(new Error('Background search failed.'));

    const previousQuery = getGithubSearchSuggestions('previous');
    const expectPreviousFailure = expect(previousQuery).rejects.toThrow('older query');

    await expect(getGithubSearchSuggestions('failed'))
      .rejects.toThrow('Background search failed.');
    expect(dispose).toHaveBeenCalledTimes(1);

    fetchGraph.mockResolvedValue(Response.json({ edges: [], logs: [], nodes: [] }));
    await expect(getGithubSearchSuggestions('replacement')).resolves.toEqual(result);

    delayedFailure.reject(new Error('An older query failed.'));
    await expectPreviousFailure;
    await expect(getGithubSearchSuggestions('current')).resolves.toEqual(result);
    expect(fetchGraph).toHaveBeenCalledTimes(3);
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
