import { WarningIcon } from '@codegena/ui-unified/icons';
import type { ReactElement } from 'react';

import { SearchSuggestionsItemLayout } from './search-suggestions-item-layout';
import type { SearchSuggestionsItemWarningProps } from './search-suggestions-item.props';

export function SearchSuggestionsItemWarning({
  item,
  query,
}: {
  item: SearchSuggestionsItemWarningProps;
  query: string;
}): ReactElement {
  return (
    <SearchSuggestionsItemLayout
      icon={(
        <WarningIcon
          aria-hidden
          size="1rem"
        />
      )}
      query={query}
      title={item.title}
      wrapTitle
    />
  );
}
