/**
 * @jest-environment jsdom
 */
import { GraphSearchClient } from '@codegena/graph-search-core';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import {
  type GraphSearchReadiness,
  GraphSearchReadinessContext,
} from './graph-search-readiness-context';
import { useGraphSearchClient } from './use-graph-search-client';
import { searchGraph } from '../__mocks__/search-graph';

const options = {};

describe('useGraphSearchClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('switches to local search if the host cannot start its search API', async () => {
    const initializeClient = jest.spyOn(GraphSearchClient.prototype, 'initialize')
      .mockResolvedValue();
    const readiness = Promise.withResolvers<GraphSearchReadiness>();

    const { result } = renderHook(
      () => useGraphSearchClient(searchGraph, 'hook-spec', options),
      {
        wrapper: ({ children }) => createElement(
          GraphSearchReadinessContext.Provider,
          { value: readiness.promise },
          children,
        ),
      },
    );

    expect(result.current.shouldUseApi).toBe(true);

    await act(async () => readiness.resolve('unavailable'));

    expect(initializeClient).not.toHaveBeenCalled();
    expect(result.current.shouldUseApi).toBe(false);
    expect(result.current.client).toBeUndefined();
  });

  it('ignores a previous graph client failure and handles the current one', async () => {
    jest.spyOn(GraphSearchClient.prototype, 'initialize').mockResolvedValue();
    jest.spyOn(GraphSearchClient.prototype, 'dispose').mockResolvedValue();

    const {
      result,
      rerender,
      unmount,
    } = renderHook(({ graph }) => (
      useGraphSearchClient(graph, 'hook-spec', options)
    ), { initialProps: { graph: searchGraph } });

    await waitFor(() => expect(result.current.client).toBeDefined());

    const previousClient = result.current.client;
    const reportPreviousFailure = result.current.failApi;

    rerender({ graph: { ...searchGraph } });
    await waitFor(() => expect(result.current.client).toBeDefined());
    expect(result.current.client).not.toBe(previousClient);

    act(reportPreviousFailure);
    expect(result.current.shouldUseApi).toBe(true);

    act(result.current.failApi);
    expect(result.current.shouldUseApi).toBe(false);
    expect(result.current.client).toBeUndefined();

    unmount();
  });
});
