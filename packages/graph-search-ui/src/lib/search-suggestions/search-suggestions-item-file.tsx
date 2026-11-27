import {
  ProgrammingLanguage,
  ProgrammingLanguageIcon,
} from '@codegena/ui-unified/icons';
import type { ReactElement } from 'react';

import { SearchSuggestionsItemLayout } from './search-suggestions-item-layout';
import type { SearchSuggestionsItemFileProps } from './search-suggestions-item.props';

export function SearchSuggestionsItemFile({
  item,
  query,
}: {
  item: SearchSuggestionsItemFileProps;
  query: string;
}): ReactElement {
  return (
    <SearchSuggestionsItemLayout
      icon={<ProgrammingLanguageIcon language={ProgrammingLanguage.TypeScript} />}
      query={query}
      snippet={item.snippet}
      title={item.title}
    />
  );
}
