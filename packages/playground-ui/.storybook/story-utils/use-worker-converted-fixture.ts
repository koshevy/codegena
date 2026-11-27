import type { ConvertedFixtureGraph } from '@codegena/graph-core/testing-utils';
import { useEffect, useState } from 'react';

import { loadWorkerConvertedFixture } from './load-worker-converted-fixture';

type FixtureState = {
  status: 'pending';
} | {
  fixture: ConvertedFixtureGraph;
  status: 'ready';
} | {
  message: string;
  status: 'error';
};

export function useWorkerConvertedFixture(
  fixtureName: string,
  fixtureBaseUrl: string,
): FixtureState {
  const [state, setState] = useState<FixtureState>({ status: 'pending' });

  useEffect(() => {
    const controller = new AbortController();

    void loadWorkerConvertedFixture({
      fixtureBaseUrl,
      fixtureName,
      signal: controller.signal,
    }).then((fixture) => {
      if (controller.signal.aborted) {
        return;
      }

      setState({ fixture, status: 'ready' });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) {
        return;
      }

      const message = error instanceof Error
        ? error.message
        : 'Specification conversion failed.';

      setState({ message, status: 'error' });
    });

    return () => {
      controller.abort();
    };
  }, [
    fixtureBaseUrl,
    fixtureName,
  ]);

  return state;
}
