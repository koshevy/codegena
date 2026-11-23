import { DeclarationTypeIcon } from '@codegena/ui-unified/icons';
import type { ReactElement } from 'react';

import { SearchSuggestionsItemLayout } from './search-suggestions-item-layout';
import type {
  SearchSuggestionsItemDeclarationProps,
} from './search-suggestions-item.props';

export function SearchSuggestionsItemDeclaration({
  item,
  query,
}: {
  item: SearchSuggestionsItemDeclarationProps;
  query: string;
}): ReactElement {
  return (
    <SearchSuggestionsItemLayout
      description={item.fileName}
      icon={(
        <DeclarationTypeIcon
          asButton={false}
          declarationType={item.declarationType}
          noHoverStyles
          title=""
        />
      )}
      query={query}
      snippet={item.snippet}
      title={item.title}
    />
  );
}
