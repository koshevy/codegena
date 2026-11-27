import type { GraphSearchSourceSpecification } from './graph-search-source';

export interface GraphPayloadMiniSearchOptions {
  defaultSuggestionCount?: number;
  directorySuggestionCount?: number;
  fileSuggestionCount?: number;
  minimumQueryLength?: number;
  recentSuggestionCount?: number;
  searchSuggestionCount?: number;
  sourceSpecification?: GraphSearchSourceSpecification;
  warningSuggestionCount?: number;
  declarationSuggestionCount?: number;
}
