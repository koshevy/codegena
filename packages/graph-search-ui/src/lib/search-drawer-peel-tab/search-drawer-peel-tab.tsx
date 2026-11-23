import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Search } from 'lucide-react';
import type { ReactElement } from 'react';

import type { SearchDrawerPeelTabProps } from './search-drawer-peel-tab.props';
import { SearchDrawerPeelTabStyles } from './search-drawer-peel-tab.styles';
import { useSearchDrawerPeelTabHotkey } from './use-search-drawer-peel-tab-hotkey';

export function SearchDrawerPeelTab({
  onClick,
}: SearchDrawerPeelTabProps): ReactElement {
  const theme = useTheme();
  const isLargeOrXxl = useMediaQuery(theme.breakpoints.up('lg'));
  const title = isLargeOrXxl
    ? 'Search in files, directories and specification'
    : 'Search';

  useSearchDrawerPeelTabHotkey(onClick);

  return (
    <SearchDrawerPeelTabStyles
      aria-label="Search in files and directories"
      onClick={onClick}
      startIcon={(
        <Search
          aria-hidden
          size={18}
        />
      )}
      type="button"
    >
      {title}
      <Tooltip title="Press Shift twice on keyboard to start search">
        <code>⇧⇧</code>
      </Tooltip>
    </SearchDrawerPeelTabStyles>
  );
}
