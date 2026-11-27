import type { ReactElement } from 'react';

import { SearchSuggestionsItemDeclaration } from './search-suggestions-item-declaration';
import { SearchSuggestionsItemDirectory } from './search-suggestions-item-directory';
import { SearchSuggestionsItemFile } from './search-suggestions-item-file';
import { SearchSuggestionsItemSpecSnippet } from './search-suggestions-item-spec-snippet';
import { SearchSuggestionsItemWarning } from './search-suggestions-item-warning';
import type { SearchSuggestionsItemProps } from './search-suggestions-item.props';

export function SearchSuggestionsItem({
  item,
  query,
}: {
  item: SearchSuggestionsItemProps;
  query: string;
}): ReactElement {
  switch (item.kind) {
    case 'file':
      return (
        <SearchSuggestionsItemFile
          item={item}
          query={query}
        />
      );
    case 'directory':
      return (
        <SearchSuggestionsItemDirectory
          item={item}
          query={query}
        />
      );
    case 'declaration':
      return (
        <SearchSuggestionsItemDeclaration
          item={item}
          query={query}
        />
      );
    case 'spec-snippet':
      return (
        <SearchSuggestionsItemSpecSnippet
          item={item}
          query={query}
        />
      );
    case 'warning':
      return (
        <SearchSuggestionsItemWarning
          item={item}
          query={query}
        />
      );
  }
}
