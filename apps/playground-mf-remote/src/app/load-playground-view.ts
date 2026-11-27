import type { ComponentType } from 'react';

import type { PlaygroundViewProps } from './playground-route';

/**
 * Load editor support only when a host opens a Playground route.
 */
export async function loadPlaygroundView(): Promise<ComponentType<PlaygroundViewProps>> {
  const {
    initializeMonaco,
    PlaygroundView,
  } = await import(/* webpackPrefetch: true */ './playground-route');

  initializeMonaco();

  return PlaygroundView;
}
