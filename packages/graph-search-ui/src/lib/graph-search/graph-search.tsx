import { type ReactElement, useCallback, useState } from 'react';

import { SearchDrawer } from '../search-drawer';
import { SearchDrawerPeelTab } from '../search-drawer-peel-tab';
import type { SearchAutocompleteItem } from '../search-suggestions';
import type { GraphSearchProps } from './graph-search.props';
import { GraphSearchStyles } from './graph-search.styles';

export function GraphSearch({
  onAutocompleteSelect,
}: GraphSearchProps): ReactElement {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback((): void => setOpen(true), []);
  const handleClose = useCallback((): void => setOpen(false), []);

  const handleSelect = useCallback((item: SearchAutocompleteItem): void => {
    onAutocompleteSelect(item);
    setOpen(false);
  }, [onAutocompleteSelect]);

  return (
    <GraphSearchStyles>
      <SearchDrawerPeelTab onClick={handleOpen} />
      <SearchDrawer
        onAutocompleteSelect={handleSelect}
        onClose={handleClose}
        open={open}
      />
    </GraphSearchStyles>
  );
}
