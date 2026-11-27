/**
 * @jest-environment node
 */
import type { ConvertedSpecification } from 'playground-mf-remote/App';
import type { LoaderFunctionArgs } from 'react-router-dom';

import { createPlaygroundLoader } from './load-playground';

function PlaygroundView(): null {
  return null;
}

function createRequest(signal?: AbortSignal): LoaderFunctionArgs {
  const url = new URL(
    'http://localhost/playground/%2Fspecifications%2Fone-password.json',
  );

  return {
    context: {},
    params: { specUrl: '/specifications/one-password.json' },
    pattern: '/playground/:specUrl',
    request: new Request(url, { signal }),
    url,
  };
}

const specification: ConvertedSpecification = {
  graph: { edges: [], logs: [], nodes: [] },
  sourceSchemaText: '{}',
};

describe('host Playground route loading', () => {
  it('reports a failed remote download to the host route', async () => {
    const failure = new Error('Remote unavailable');
    const loadRemote = jest.fn(async () => ({
      createSpecificationLoader: () => async () => specification,
      loadPlaygroundView: async () => PlaygroundView,
    }));

    loadRemote.mockRejectedValueOnce(failure);

    const load = createPlaygroundLoader('build-1', loadRemote);

    await expect(load(createRequest())).rejects.toBe(failure);
    await expect(load(createRequest())).resolves.toEqual({
      specification,
      View: PlaygroundView,
    });
    expect(loadRemote).toHaveBeenCalledTimes(2);
  });

  it('reuses the remote conversion loader between navigations', async () => {
    const convert = jest.fn(async () => specification);
    const createSpecificationLoader = jest.fn(() => convert);
    const loadRemote = jest.fn(async () => ({
      createSpecificationLoader,
      loadPlaygroundView: async () => PlaygroundView,
    }));
    const load = createPlaygroundLoader('build-1', loadRemote);
    const request = createRequest();

    expect(loadRemote).not.toHaveBeenCalled();
    await expect(load(request)).resolves.toEqual({ specification, View: PlaygroundView });
    await load(request);

    expect(loadRemote).toHaveBeenCalledTimes(1);
    expect(createSpecificationLoader).toHaveBeenCalledWith('build-1');
    expect(createSpecificationLoader).toHaveBeenCalledTimes(1);
    expect(convert).toHaveBeenNthCalledWith(1, request);
    expect(convert).toHaveBeenNthCalledWith(2, request);
  });

  it('does not start conversion after an abandoned remote download', async () => {
    const pendingView = Promise.withResolvers<typeof PlaygroundView>();
    const controller = new AbortController();
    const convert = jest.fn(async () => specification);
    const load = createPlaygroundLoader('build-1', async () => ({
      createSpecificationLoader: () => convert,
      loadPlaygroundView: () => pendingView.promise,
    }));

    const loading = load(createRequest(controller.signal));

    controller.abort();
    pendingView.resolve(PlaygroundView);

    await expect(loading).rejects.toMatchObject({ name: 'AbortError' });
    expect(convert).not.toHaveBeenCalled();
  });

  it('forwards the navigation signal and rejects a late conversion result', async () => {
    const result = Promise.withResolvers<ConvertedSpecification>();
    const started = Promise.withResolvers<void>();
    const controller = new AbortController();
    const convert = jest.fn((args: LoaderFunctionArgs) => {
      expect(args.request.signal.aborted).toBe(false);
      started.resolve();

      return result.promise;
    });
    const load = createPlaygroundLoader('build-1', async () => ({
      createSpecificationLoader: () => convert,
      loadPlaygroundView: async () => PlaygroundView,
    }));
    const request = createRequest(controller.signal);

    const loading = load(request);

    await started.promise;
    controller.abort();
    result.resolve(specification);

    await expect(loading).rejects.toMatchObject({ name: 'AbortError' });
    expect(convert).toHaveBeenCalledWith(request);
    expect(request.request.signal.aborted).toBe(true);
  });
});
