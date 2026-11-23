import { FolderStateIcon } from '@codegena/ui-unified/icons';
import type { ReactElement } from 'react';

import { SearchSuggestionsItemLayout } from './search-suggestions-item-layout';
import type {
  SearchSuggestionsItemDirectoryProps,
} from './search-suggestions-item.props';

export function SearchSuggestionsItemDirectory({
  item,
  query,
}: {
  item: SearchSuggestionsItemDirectoryProps;
  query: string;
}): ReactElement {
  const description = [
    `${item.directoryCount} directories`,
    `${item.fileCount} files`,
  ].join(' · ');

  return (
    <SearchSuggestionsItemLayout
      description={description}
      icon={<FolderStateIcon isExpanded={false} />}
      query={query}
      title={item.title}
    />
  );
}
