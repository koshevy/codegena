import type { SearchAutocompleteItem } from '../search-suggestions';

export interface GraphSearchProps {
  onAutocompleteSelect: (selectedItem: SearchAutocompleteItem) => void;
}
