import type {
  ConvertedSpecification,
  PlaygroundViewProps,
} from 'playground-mf-remote/App';
import type { ComponentType } from 'react';
import type { LoaderFunctionArgs } from 'react-router-dom';

import type { PlaygroundRouteData } from './session';

export type LoadPlaygroundRemote = () => Promise<Pick<
  typeof import('playground-mf-remote/App'),
  'createSpecificationLoader' | 'loadPlaygroundView'
>>;

interface PreparedPlayground {
  loadSpecification: (args: LoaderFunctionArgs) => Promise<ConvertedSpecification>;
  View: ComponentType<PlaygroundViewProps>;
}

async function preparePlayground(
  appBuildId: string,
  loadRemote: LoadPlaygroundRemote,
): Promise<PreparedPlayground> {
  const remote = await loadRemote();
  const View = await remote.loadPlaygroundView();

  return { loadSpecification: remote.createSpecificationLoader(appBuildId), View };
}

/**
 * Reuse one conversion loader while the host router owns navigation and aborts.
 */
export function createPlaygroundLoader(
  appBuildId: string,
  loadRemote: LoadPlaygroundRemote,
): (args: LoaderFunctionArgs) => Promise<PlaygroundRouteData> {
  let prepared: Promise<PreparedPlayground> | undefined;

  return async (args) => {
    const pending = prepared ??= preparePlayground(appBuildId, loadRemote);

    let ready: PreparedPlayground;

    try {
      ready = await pending;
    }
    catch (error) {
      if (prepared === pending) {
        prepared = undefined;
      }

      throw error;
    }

    const {
      loadSpecification,
      View,
    } = ready;

    args.request.signal.throwIfAborted();

    const specification = await loadSpecification(args);

    args.request.signal.throwIfAborted();

    return { specification, View };
  };
}
