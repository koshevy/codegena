import Box from '@mui/material/Box';
import {
  type KeyboardEvent,
  type ReactElement,
  useCallback,
  useRef,
} from 'react';

import { SearchAutocomplete } from '../search-autocomplete';
import type { SearchDrawerProps } from './search-drawer.props';
import { searchDrawerClasses, SearchDrawerStyles } from './search-drawer.styles';

export function SearchDrawer({
  onAutocompleteSelect,
  onClose,
  open,
  placeholder,
}: SearchDrawerProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchKeyDown = useCallback((
    event: KeyboardEvent<HTMLDivElement>,
  ): void => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  const handleEntered = useCallback((): void => {
    inputRef.current?.focus();
  }, []);

  return (
    <SearchDrawerStyles
      anchor="top"
      className={searchDrawerClasses.root}
      data-lenis-prevent
      onClose={onClose}
      open={open}
      PaperProps={{
        'aria-label': 'Search generated files and directories',
        'role': 'dialog',
      }}
      SlideProps={{ onEntered: handleEntered }}
    >
      <Box
        className={searchDrawerClasses.search}
        onKeyDownCapture={handleSearchKeyDown}
      >
        <SearchAutocomplete
          inputRef={inputRef}
          onAutocompleteSelect={onAutocompleteSelect}
          placeholder={placeholder}
        />
      </Box>
    </SearchDrawerStyles>
  );
}
