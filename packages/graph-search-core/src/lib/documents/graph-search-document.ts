import type { GraphSuggestion } from '../graph-suggestion';

export interface GraphSearchDocument {
  id: string;
  searchText: string;
  snippetMatchText?: string;
  snippetStartLine?: number;
  snippetText?: string;
  suggestion: GraphSuggestion;
  title: string;
  warningLevel?: string;
}
