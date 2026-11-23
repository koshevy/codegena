import type {
  GraphSearchClient,
  GraphSearchSuggestionsResult,
} from '@codegena/graph-search-core';

interface GithubSearchSource {
  dispose: () => void;
  getSuggestions: (query: string) => Promise<GraphSearchSuggestionsResult>;
}

/**
 * Lazily connect the demo to the app's background search service.
 * The feature owner releases this source when it unmounts.
 */
export function createGithubSearchSource(appBuildId: string): GithubSearchSource {
  let pendingClient: Promise<GraphSearchClient> | undefined;
  let controller: AbortController | undefined;

  async function connectClient(signal: AbortSignal): Promise<GraphSearchClient> {
    const { loadGithubSearchClient } = await import('./load-github-search-client');

    return loadGithubSearchClient(appBuildId, signal);
  }

  function dispose(): void {
    const previous = pendingClient;

    pendingClient = undefined;
    controller?.abort();
    void previous?.then((client) => client.dispose()).catch(() => null);
  }

  async function getSuggestions(query: string): Promise<GraphSearchSuggestionsResult> {
    if (!pendingClient) {
      controller = new AbortController();
      pendingClient = connectClient(controller.signal);
    }

    const current = pendingClient;

    try {
      const client = await current;

      return await client.getSearchSuggestions(query);
    }
    catch (error) {
      if (pendingClient === current) {
        dispose();
      }

      throw error;
    }
  }

  return { dispose, getSuggestions };
}
