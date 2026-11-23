import type { ReactNode } from 'react';

import { searchSuggestionsItemClasses } from './search-suggestions-item.styles';

export function renderHighlightedText(text: string, query: string): ReactNode {
  const searchTerm = query.trim();

  if (!searchTerm) {
    return text;
  }

  const exactIndex = text.indexOf(searchTerm);
  const matchIndex = exactIndex === -1
    ? text.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase())
    : exactIndex;

  if (matchIndex === -1) {
    return text;
  }

  const matchEnd = matchIndex + searchTerm.length;

  return (
    <>
      {text.slice(0, matchIndex)}
      <mark className={searchSuggestionsItemClasses.match}>
        {text.slice(matchIndex, matchEnd)}
      </mark>
      {text.slice(matchEnd)}
    </>
  );
}
