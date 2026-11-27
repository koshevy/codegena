import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import {
  type Dispatch,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
} from 'react';

import type { SearchAutocompleteItem } from '../search-suggestions';
import { renderSearchAutocompleteInput } from './render-search-autocomplete-input';

interface SearchAutocompleteHandlersProps {
  hasCurrentResults: boolean;
  inputRef?: Ref<HTMLInputElement>;
  onAutocompleteSelect: (item: SearchAutocompleteItem) => void;
  placeholder: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setQuery: Dispatch<SetStateAction<string>>;
}

export function useSearchAutocompleteHandlers({
  hasCurrentResults,
  inputRef,
  onAutocompleteSelect,
  placeholder,
  setIsOpen,
  setQuery,
}: SearchAutocompleteHandlersProps): {
  handleChange: (
    event: SyntheticEvent,
    selectedItem: SearchAutocompleteItem | string | null,
  ) => void;
  handleClose: () => void;
  handleInputChange: (event: SyntheticEvent, value: string) => void;
  handleKeyDownCapture: (event: KeyboardEvent<HTMLDivElement>) => void;
  handleOpen: () => void;
  renderInput: (params: AutocompleteRenderInputParams) => ReactElement;
} {
  const handleClose = useCallback((): void => {
    setIsOpen(false);
  }, [
    setIsOpen,
  ]);

  const handleOpen = useCallback((): void => {
    setIsOpen(true);
  }, [
    setIsOpen,
  ]);

  const handleInputChange = useCallback((
    _event: SyntheticEvent,
    value: string,
  ): void => {
    setQuery(value);
  }, [
    setQuery,
  ]);

  const handleKeyDownCapture = useCallback((
    event: KeyboardEvent<HTMLDivElement>,
  ): void => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, [
    setIsOpen,
  ]);

  const handleChange = useCallback((
    _event: SyntheticEvent,
    selectedItem: SearchAutocompleteItem | string | null,
  ): void => {
    const hasSelectedCurrentOption = hasCurrentResults
      && selectedItem !== null
      && typeof selectedItem !== 'string';

    if (hasSelectedCurrentOption) {
      onAutocompleteSelect(selectedItem);
    }
  }, [
    hasCurrentResults,
    onAutocompleteSelect,
  ]);

  const renderInput = useCallback((
    params: AutocompleteRenderInputParams,
  ): ReactElement => (
    renderSearchAutocompleteInput({
      inputRef,
      onBlur: handleClose,
      params,
      placeholder,
    })
  ), [
    handleClose,
    inputRef,
    placeholder,
  ]);

  return {
    handleChange,
    handleClose,
    handleInputChange,
    handleKeyDownCapture,
    handleOpen,
    renderInput,
  };
}
