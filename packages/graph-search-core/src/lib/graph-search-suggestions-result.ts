import type { GraphSuggestion } from './graph-suggestion';

export interface GraphSearchSuggestionsResult {
  isTruncated: boolean;
  suggestions: GraphSuggestion[];
}
