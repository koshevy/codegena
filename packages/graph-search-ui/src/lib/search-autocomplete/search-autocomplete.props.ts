import type { Ref } from 'react';

import type { SearchAutocompleteItem } from '../search-suggestions';

export interface SearchAutocompleteProps {
  inputRef?: Ref<HTMLInputElement>;
  onAutocompleteSelect: (selectedItem: SearchAutocompleteItem) => void;
  placeholder?: string;
}
