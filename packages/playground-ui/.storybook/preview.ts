import { graphSearchApiPath } from '@codegena/graph-search-core';
import {
  type GraphSearchReadiness,
  GraphSearchReadinessContext,
} from '@codegena/graph-search-core/react';
import {
  initializeServiceWorker,
  registerServiceWorkerRoute,
} from '@codegena/pwa/service-worker-client';
import { codegenaStorybookPreview } from '@codegena/ui-theme/storybook';
import '@codegena/ui-unified/monaco-workers';
import type { Decorator, Preview } from '@storybook/react-vite';
import { createElement } from 'react';

import { appBuildId } from './environment';
import { withPlaygroundNotifications } from './with-playground-notifications';

const buildParams = new URLSearchParams({ buildId: appBuildId });
const buildQuery = buildParams.toString();

const inheritedDecorators = codegenaStorybookPreview.decorators;
const decorators = Array.isArray(inheritedDecorators)
  ? inheritedDecorators
  : [inheritedDecorators].filter((decorator) => decorator !== undefined);

async function prepareGraphSearchApi(): Promise<GraphSearchReadiness> {
  try {
    await initializeServiceWorker(appBuildId);
    await registerServiceWorkerRoute({
      httpMethod: 'POST',
      moduleUrl: `/graph-search-api.js?${buildQuery}`,
      routeBaseUrl: graphSearchApiPath,
    });

    return 'ready';
  }
  catch {
    return 'unavailable';
  }
}

function createPreview(): Preview {
  let searchApiReadiness: Promise<GraphSearchReadiness> | null = null;

  const withGraphSearchReadiness: Decorator = (Story) => createElement(
    GraphSearchReadinessContext.Provider,
    { value: searchApiReadiness },
    createElement(Story),
  );

  return {
    ...codegenaStorybookPreview,
    beforeAll: () => {
      searchApiReadiness = prepareGraphSearchApi();
    },
    decorators: [
      withGraphSearchReadiness,
      withPlaygroundNotifications,
      ...decorators,
    ],
  };
}

export default createPreview();
