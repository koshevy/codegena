import clsx from 'clsx';
import type { ReactElement } from 'react';

import { renderHighlightedText } from './render-highlighted-text';
import {
  searchSuggestionsCodeSnippetClasses,
} from './search-suggestions-code-snippet.styles';
import type { SearchSuggestionsCodeLineData } from './search-suggestions-item.props';

interface SearchSuggestionsCodeLineProps {
  activeLineNumber: number;
  line: SearchSuggestionsCodeLineData;
  query: string;
}

export function SearchSuggestionsCodeLine({
  activeLineNumber,
  line,
  query,
}: SearchSuggestionsCodeLineProps): ReactElement {
  return (
    <span
      className={clsx({
        [searchSuggestionsCodeSnippetClasses.line]: true,
        [searchSuggestionsCodeSnippetClasses.active]: (
          line.lineNumber === activeLineNumber
        ),
      })}
      role="listitem"
    >
      <span className={searchSuggestionsCodeSnippetClasses.gutter}>
        <span className={searchSuggestionsCodeSnippetClasses.lineNumber}>
          {line.lineNumber}
        </span>
        <span className={searchSuggestionsCodeSnippetClasses.divider}>
          |
        </span>
      </span>
      <span className={searchSuggestionsCodeSnippetClasses.content}>
        {renderHighlightedText(line.content, query)}
      </span>
    </span>
  );
}
