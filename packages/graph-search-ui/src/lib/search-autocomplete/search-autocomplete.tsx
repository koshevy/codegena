import Autocomplete from '@mui/material/Autocomplete';
import {
  type ReactElement,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  SearchSuggestions,
  SearchSuggestionsEmptyState,
  SearchSuggestionsTruncationContext,
  useSearchSuggestionsSource,
  type SearchAutocompleteItem,
} from '../search-suggestions';
import { renderSearchAutocompleteGroup } from './render-search-autocomplete-group';
import { renderSearchAutocompleteOption } from './render-search-autocomplete-option';
import type { SearchAutocompleteProps } from './search-autocomplete.props';
import {
  searchAutocompleteClasses,
  SearchAutocompleteStyles,
} from './search-autocomplete.styles';
import { useResolved } from './use-resolved';
import { useSearchAutocompleteHandlers } from './use-search-autocomplete-handlers';
import { VirtualSearchSuggestionsListbox } from './virtual-search-suggestions-listbox';

function keepSourceResults(
  options: SearchAutocompleteItem[],
): SearchAutocompleteItem[] {
  return options;
}

const suggestionGroups = {
  'directory': 'Directories',
  'declaration': 'Declarations',
  'file': 'Files',
  'warning': 'Warnings',
  'spec-snippet': 'Specification',
} as const;

const getInitialVersion = (): number => 0;

function getSuggestionGroup(item: SearchAutocompleteItem): string {
  return suggestionGroups[item.kind];
}

function getDefaultSuggestionGroup(): string {
  return 'Suggested';
}

function getOptionLabel(item: SearchAutocompleteItem | string): string {
  return typeof item === 'string' ? item : item.title;
}

export function SearchAutocomplete({
  inputRef,
  onAutocompleteSelect,
  placeholder = 'Search files, directories…',
}: SearchAutocompleteProps): ReactElement {
  const { getVersion, source, subscribe } = useSearchSuggestionsSource();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const version = useSyncExternalStore(
    subscribe,
    getVersion,
    getInitialVersion,
  );

  const resolved = useResolved(query, source, version);
  const options = resolved.suggestions;

  const hasCurrentResults = resolved.query === query;

  const hasNoResults = query.trim().length > 0
    && resolved.query.trim().length > 0
    && options.length === 0;

  const hasToOpenSuggestions = isOpen && options.length > 0;
  const hasToShowEmptyState = isOpen && hasNoResults;

  const groupSuggestionsBy = query.trim().length < 3
    ? getDefaultSuggestionGroup
    : getSuggestionGroup;

  const {
    handleChange,
    handleClose,
    handleInputChange,
    handleKeyDownCapture,
    handleOpen,
    renderInput,
  } = useSearchAutocompleteHandlers({
    hasCurrentResults,
    inputRef,
    onAutocompleteSelect,
    placeholder,
    setIsOpen,
    setQuery,
  });

  const renderedEmptyState = hasToShowEmptyState && (
    <SearchSuggestions className={searchAutocompleteClasses.empty}>
      <SearchSuggestionsEmptyState />
    </SearchSuggestions>
  );

  return (
    <SearchAutocompleteStyles onKeyDownCapture={handleKeyDownCapture}>
      <SearchSuggestionsTruncationContext.Provider value={resolved.isTruncated}>
        <Autocomplete<SearchAutocompleteItem, false, false, true>
          autoHighlight
          disablePortal
          filterOptions={keepSourceResults}
          freeSolo
          groupBy={groupSuggestionsBy}
          getOptionLabel={getOptionLabel}
          inputValue={query}
          ListboxComponent={VirtualSearchSuggestionsListbox}
          onClose={handleClose}
          onChange={handleChange}
          onInputChange={handleInputChange}
          onOpen={handleOpen}
          open={hasToOpenSuggestions}
          openOnFocus
          options={options}
          PaperComponent={SearchSuggestions}
          renderInput={renderInput}
          renderGroup={renderSearchAutocompleteGroup}
          renderOption={renderSearchAutocompleteOption}
        />
        {renderedEmptyState}
      </SearchSuggestionsTruncationContext.Provider>
    </SearchAutocompleteStyles>
  );
}
