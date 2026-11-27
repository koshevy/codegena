import {
  GraphSearchClient,
  graphSearchApiPath,
  graphSearchPayloadSchema,
} from '@codegena/graph-search-core';
import {
  initializeServiceWorker,
  registerServiceWorkerRoute,
} from '@codegena/pwa/service-worker-client';

export async function loadGithubSearchClient(
  buildId: string,
  signal: AbortSignal,
): Promise<GraphSearchClient> {
  signal.throwIfAborted();

  const buildParams = new URLSearchParams({ buildId });
  const buildQuery = buildParams.toString();

  await initializeServiceWorker(buildId);
  signal.throwIfAborted();

  await registerServiceWorkerRoute({
    httpMethod: 'POST',
    moduleUrl: `/graph-search-api.js?${buildQuery}`,
    routeBaseUrl: graphSearchApiPath,
  });

  signal.throwIfAborted();

  const response = await fetch('/assets/github-search-graph.json', { signal });

  if (!response.ok) {
    throw new Error('The GitHub API search demo could not be loaded.');
  }

  const graph: unknown = await response.json();

  signal.throwIfAborted();

  const graphPayload = graphSearchPayloadSchema.parse(graph);

  return new GraphSearchClient(graphPayload, 'github-rest-api-landing-demo');
}
