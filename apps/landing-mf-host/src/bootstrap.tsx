import { BundleWarmupContext } from '@codegena/pwa/bundle-warmup-context';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { App, createAppRouter, loadHydratableLanding } from './app';
import {
  appBuildId,
  bundleWarmupRuntime,
  csrExtrasGroups,
  devModeEnv,
  ssrExtrasGroups,
  warmAfterPaintedGroups,
} from './environment';

async function startLanding(): Promise<void> {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('The landing application needs its root element.');
  }

  const hasServerMarkup = rootElement.dataset['serverRendered'] === 'true';
  const initialLanding = hasServerMarkup
    ? await loadHydratableLanding(rootElement)
    : undefined;

  const extrasGroups = hasServerMarkup ? ssrExtrasGroups : csrExtrasGroups;

  const router = createAppRouter({
    appBuildId,
    extrasGroups,
    initialLanding,
    loadDocumentation: () => import('documentation-mf-remote/App'),
    loadPlayground: () => import('playground-mf-remote/App'),
    warmAfterPaintedGroups,
  });

  const renderedApp = (
    <StrictMode>
      <BundleWarmupContext.Provider value={bundleWarmupRuntime}>
        <App
          router={router}
          devModeEnv={devModeEnv}
        />
      </BundleWarmupContext.Provider>
    </StrictMode>
  );

  if (hasServerMarkup) {
    hydrateRoot(rootElement, renderedApp);

    return;
  }

  createRoot(rootElement).render(renderedApp);
}

void startLanding();
