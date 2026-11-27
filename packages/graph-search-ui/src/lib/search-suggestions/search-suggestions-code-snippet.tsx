import { useThemedScrollArea } from '@codegena/ui-unified/scrolling';
import { type ReactElement, useRef } from 'react';

import { SearchSuggestionsCodeLine } from './search-suggestions-code-line';
import {
  SearchSuggestionsCodeSnippetHostStyles,
  SearchSuggestionsCodeSnippetStyles,
} from './search-suggestions-code-snippet.styles';
import type {
  SearchSuggestionsCodeSnippet as CodeSnippet,
} from './search-suggestions-item.props';
import { useRevealSearchSnippetMatch } from './use-reveal-search-snippet-match';

interface SearchSuggestionsCodeSnippetProps {
  query: string;
  snippet: CodeSnippet;
}

export function SearchSuggestionsCodeSnippet({
  query,
  snippet,
}: SearchSuggestionsCodeSnippetProps): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useThemedScrollArea(hostRef, viewportRef);
  useRevealSearchSnippetMatch(viewportRef, snippet, query);

  return (
    <SearchSuggestionsCodeSnippetHostStyles ref={hostRef}>
      <SearchSuggestionsCodeSnippetStyles
        aria-label="Matching code excerpt"
        ref={viewportRef}
        role="list"
      >
        {snippet.lines.map((line) => (
          <SearchSuggestionsCodeLine
            activeLineNumber={snippet.activeLineNumber}
            key={line.lineNumber}
            line={line}
            query={query}
          />
        ))}
      </SearchSuggestionsCodeSnippetStyles>
    </SearchSuggestionsCodeSnippetHostStyles>
  );
}
