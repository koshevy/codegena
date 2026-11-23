import type { GraphSearchSuggestionsResult } from './graph-search-suggestions-result';

export interface GraphSearchSourceSpecification {
  fileName: string;
  text: string;
}

/**
 * Return ranked suggestions from a local index or an asynchronous search API.
 */
export type GraphSearchSource = (
  query: string,
) => GraphSearchSuggestionsResult | Promise<GraphSearchSuggestionsResult>;
