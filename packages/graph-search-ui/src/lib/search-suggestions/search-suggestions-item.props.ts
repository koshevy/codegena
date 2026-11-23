import type {
  GraphSuggestion,
  GraphSuggestionCodeLine,
  GraphSuggestionCodeSnippet,
  GraphSuggestionDeclaration,
  GraphSuggestionDirectory,
  GraphSuggestionFile,
  GraphSuggestionSpecification,
  GraphSuggestionWarning,
} from '@codegena/graph-search-core';

export type SearchSuggestionsItemProps = GraphSuggestion;
export type SearchSuggestionsItemFileProps = GraphSuggestionFile;
export type SearchSuggestionsItemDirectoryProps = GraphSuggestionDirectory;
export type SearchSuggestionsItemDeclarationProps = GraphSuggestionDeclaration;
export type SearchSuggestionsItemWarningProps = GraphSuggestionWarning;
export type SearchSuggestionsItemSpecSnippetProps = GraphSuggestionSpecification;
export type SearchSuggestionsCodeLineData = GraphSuggestionCodeLine;
export type SearchSuggestionsCodeSnippet = GraphSuggestionCodeSnippet;
export type SearchAutocompleteItem = GraphSuggestion;
