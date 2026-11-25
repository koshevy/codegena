import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import type { ReactElement } from 'react';

import { GetStartedStyles } from './get-started.styles';
import { menuAction } from './menu-items';
import { HostLink } from '../navigation';

export function GetStarted(): ReactElement {
  const renderedIcon = <ArrowOutwardIcon aria-hidden />;

  return (
    <GetStartedStyles
      aria-description="Open the Codegena getting started guide."
      component={HostLink}
      endIcon={renderedIcon}
      href={menuAction.href}
      size="small"
      variant="outlined"
    >
      {menuAction.label}
    </GetStartedStyles>
  );
}
