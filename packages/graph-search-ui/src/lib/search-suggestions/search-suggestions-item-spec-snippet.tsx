import {
  ProgrammingLanguage,
  ProgrammingLanguageIcon,
} from '@codegena/ui-unified/icons';
import type { ReactElement } from 'react';

import { SearchSuggestionsItemLayout } from './search-suggestions-item-layout';
import type {
  SearchSuggestionsItemSpecSnippetProps,
} from './search-suggestions-item.props';

export function SearchSuggestionsItemSpecSnippet({
  item,
  query,
}: {
  item: SearchSuggestionsItemSpecSnippetProps;
  query: string;
}): ReactElement {
  return (
    <SearchSuggestionsItemLayout
      icon={<ProgrammingLanguageIcon language={ProgrammingLanguage.JSON} />}
      query={query}
      snippet={item.snippet}
      title={item.title}
    />
  );
}
