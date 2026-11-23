import type { SearchAutocompleteItem } from '../search-suggestions';

export interface SearchDrawerProps {
  onClose: () => void;
  onAutocompleteSelect: (selectedItem: SearchAutocompleteItem) => void;
  open: boolean;
  placeholder?: string;
}
