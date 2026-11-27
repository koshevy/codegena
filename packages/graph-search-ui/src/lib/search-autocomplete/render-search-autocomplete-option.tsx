import type { AutocompleteRenderOptionState } from '@mui/material/Autocomplete';
import type { HTMLAttributes, Key, ReactElement } from 'react';

import {
  SearchSuggestionsItem,
  type SearchAutocompleteItem,
} from '../search-suggestions';

function getSuggestionAccessibleLabel(item: SearchAutocompleteItem): string {
  if (item.kind === 'file') {
    return `TypeScript ${item.title}`;
  }

  if (item.kind === 'declaration') {
    return `${item.title} ${item.fileName}`;
  }

  if (item.kind === 'warning') {
    return `Warning: ${item.title}`;
  }

  return item.title;
}

export function renderSearchAutocompleteOption(
  props: HTMLAttributes<HTMLLIElement> & { key: Key },
  item: SearchAutocompleteItem,
  { inputValue }: AutocompleteRenderOptionState,
): ReactElement {
  const { key: _key, ...optionProps } = props;
  const suggestionLabel = getSuggestionAccessibleLabel(item);
  const warningLabel = item.kind === 'warning' ? suggestionLabel : undefined;

  return (
    <li
      {...optionProps}
      aria-label={warningLabel}
      data-suggestion-kind={item.kind}
      data-suggestion-label={suggestionLabel}
      key={item.id}
    >
      <SearchSuggestionsItem
        item={item}
        query={inputValue}
      />
    </li>
  );
}
