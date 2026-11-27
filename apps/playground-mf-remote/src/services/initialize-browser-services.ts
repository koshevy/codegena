import { graphSearchApiPath } from '@codegena/graph-search-core';
import {
  initializeServiceWorker,
  registerServiceWorkerRoute,
} from '@codegena/pwa/service-worker-client';

import { specificationApiPath } from './specification';

export async function initializeBrowserServices(appBuildId: string): Promise<void> {
  const params = new URLSearchParams({ buildId: appBuildId });
  const query = params.toString();

  await initializeServiceWorker(appBuildId);
  await Promise.all([
    registerServiceWorkerRoute({
      httpMethod: 'POST',
      moduleUrl: `/graph-search-api.js?${query}`,
      routeBaseUrl: graphSearchApiPath,
    }),
    ...(['POST', 'GET', 'DELETE'] as const).map((httpMethod) => (
      registerServiceWorkerRoute({
        httpMethod,
        moduleUrl: `/specification-api.js?${query}`,
        routeBaseUrl: specificationApiPath,
      })
    )),
  ]);
}
