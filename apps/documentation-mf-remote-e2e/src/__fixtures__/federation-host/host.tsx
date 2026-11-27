import { loadRemote } from '@module-federation/enhanced/runtime';
import { lazy, Suspense, type ReactElement } from 'react';

import type { DocumentationRemoteModule } from './remote';

const Documentation = lazy(async () => {
  const module = await loadRemote<DocumentationRemoteModule>('documentation/App');

  if (!module) {
    throw new Error('The documentation federation module did not load.');
  }

  await module.initializeDocumentation('/');

  return module;
});

export function Host(): ReactElement {
  const renderedLoading = <p role="status">Loading documentation</p>;

  return (
    <Suspense fallback={renderedLoading}>
      <Documentation />
    </Suspense>
  );
}
