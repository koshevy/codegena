import GlobalStyles from '@mui/material/GlobalStyles';
import type { ReactElement } from 'react';

import { useWindowScrollbar } from './use-window-scrollbar';
import { getWindowScrollbarStyles } from './window-scrollbar.styles';

export function WindowScrollbar(): ReactElement {
  useWindowScrollbar();

  return <GlobalStyles styles={getWindowScrollbarStyles} />;
}
