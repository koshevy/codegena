import type { IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { ReactElement } from 'react';

import { WarningIcon } from '../warning-icon';
import { WarningIconButtonStyles } from './warning-icon-button.styles';

export interface WarningIconButtonProps extends Omit<
  IconButtonProps,
  'aria-label' | 'children' | 'size'
> {
  ariaLabel: string;
  iconSize?: number | string;
  title: string;
}

export function WarningIconButton({
  ariaLabel,
  iconSize = '.8rem',
  title,
  ...buttonProps
}: WarningIconButtonProps): ReactElement {
  return (
    <Tooltip title={title}>
      <WarningIconButtonStyles
        aria-label={ariaLabel}
        size="small"
        {...buttonProps}
      >
        <WarningIcon
          aria-hidden
          size={iconSize}
        />
      </WarningIconButtonStyles>
    </Tooltip>
  );
}
