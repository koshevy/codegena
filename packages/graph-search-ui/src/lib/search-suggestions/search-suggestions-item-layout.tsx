import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { type ReactElement, type ReactNode, useMemo } from 'react';

import { renderHighlightedText } from './render-highlighted-text';
import { SearchSuggestionsCodeSnippet } from './search-suggestions-code-snippet';
import type {
  SearchSuggestionsCodeSnippet as CodeSnippet,
} from './search-suggestions-item.props';
import {
  searchSuggestionsItemClasses,
  SearchSuggestionsItemStyles,
} from './search-suggestions-item.styles';

interface SearchSuggestionsItemLayoutProps {
  description?: string;
  icon: ReactNode;
  query: string;
  snippet?: CodeSnippet;
  title: string;
  wrapTitle?: boolean;
}

export function SearchSuggestionsItemLayout({
  description,
  icon,
  query,
  snippet,
  title,
  wrapTitle = false,
}: SearchSuggestionsItemLayoutProps): ReactElement {
  const renderedDescription = useMemo(() => {
    if (!description) {
      return null;
    }

    return (
      <Typography
        className={searchSuggestionsItemClasses.description}
        component="span"
        variant="caption"
      >
        {renderHighlightedText(description, query)}
      </Typography>
    );
  }, [
    description,
    query,
  ]);

  const renderedSnippet = snippet && (
    <SearchSuggestionsCodeSnippet
      query={query}
      snippet={snippet}
    />
  );

  return (
    <SearchSuggestionsItemStyles className={searchSuggestionsItemClasses.root}>
      <span className={searchSuggestionsItemClasses.icon}>
        {icon}
      </span>
      <span className={searchSuggestionsItemClasses.text}>
        <Typography
          className={clsx({
            [searchSuggestionsItemClasses.title]: true,
            [searchSuggestionsItemClasses.wrapTitle]: wrapTitle,
          })}
          component="span"
          variant="body2"
        >
          {renderHighlightedText(title, query)}
        </Typography>
        {renderedDescription}
      </span>
      {renderedSnippet}
    </SearchSuggestionsItemStyles>
  );
}
