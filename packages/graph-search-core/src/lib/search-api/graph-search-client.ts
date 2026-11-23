import {
  type GraphPayload,
  mapGraphPayloadToWorkerPayload,
} from '@codegena/graph-core';

import {
  graphSearchApiPath,
  type GraphSearchRequest,
  graphSearchResultSchema,
} from './graph-search-api-contract';
import type { GraphPayloadMiniSearchOptions } from '../graph-payload-mini-search-options';
import type { GraphSearchSuggestionsResult } from '../graph-search-suggestions-result';

/**
 * One graph's search session over the virtual HTTP API. The host initializes
 * PWA and registers the API module before using this client.
 */
export class GraphSearchClient {
  private readonly sessionId = crypto.randomUUID();
  private readonly graphPayload: GraphPayload;
  private initialized?: Promise<void>;
  private isDisposed = false;

  constructor(
    graphPayload: GraphPayload,
    private readonly ownerSpecId: string,
    private readonly options: GraphPayloadMiniSearchOptions = {},
  ) {
    this.graphPayload = mapGraphPayloadToWorkerPayload(graphPayload);
  }

  async initialize(): Promise<void> {
    this.assertActive();
    this.initialized ??= this.initializeSession();
    await this.initialized;
    this.assertActive();
  }

  async getSearchSuggestions(query = ''): Promise<GraphSearchSuggestionsResult> {
    const response = await this.query({
      action: 'search', query, sessionId: this.sessionId,
    });
    const result: unknown = await response.json();

    return graphSearchResultSchema.parse(result);
  }

  async getAutoSuggestion(query: string): Promise<string> {
    const response = await this.query({
      action: 'autoSuggest', query, sessionId: this.sessionId,
    });

    return response.text();
  }

  async dispose(): Promise<void> {
    this.isDisposed = true;

    if (!this.initialized) {
      return;
    }

    try {
      await this.initialized;
      await this.send({ action: 'dispose', sessionId: this.sessionId });
    }
    catch {
      // A failed or released API session no longer has an index to dispose.
    }
  }

  private async query(request: GraphSearchRequest): Promise<Response> {
    await this.initialize();

    const response = await this.send(request);

    this.assertActive();

    if (response.status === 404) {
      this.initialized = undefined;
      await this.initialize();

      const recovered = await this.send(request);

      this.assertActive();
      this.checkResponse(recovered);

      return recovered;
    }

    this.checkResponse(response);

    return response;
  }

  private async initializeSession(): Promise<void> {
    const response = await this.send({
      action: 'initialize',
      graphPayload: this.graphPayload,
      options: this.options,
      ownerSpecId: this.ownerSpecId,
      sessionId: this.sessionId,
    });

    this.checkResponse(response);
  }

  private send(request: GraphSearchRequest): Promise<Response> {
    return fetch(graphSearchApiPath, {
      body: JSON.stringify(request),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
    });
  }

  private assertActive(): void {
    if (this.isDisposed) {
      throw new Error('The graph search session has been disposed.');
    }
  }

  private checkResponse(response: Response): void {
    if (!response.ok) {
      throw new Error(`Graph search API request failed (${response.status}).`);
    }
  }
}
