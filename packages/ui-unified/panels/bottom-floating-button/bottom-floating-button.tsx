import clsx from 'clsx';
import type { ReactElement } from 'react';

import type { BottomFloatingButtonProps } from './bottom-floating-button.props';
import {
  bottomFloatingButtonClasses,
  BottomFloatingButtonStyles,
} from './bottom-floating-button.styles';

export function BottomFloatingButton({
  ariaLabel,
  color = 'primary',
  icon,
  label,
  onClick,
  position = 'absolute',
}: BottomFloatingButtonProps): ReactElement {
  return (
    <BottomFloatingButtonStyles
      aria-label={ariaLabel}
      className={clsx({
        [bottomFloatingButtonClasses.fixed]: position === 'fixed',
      })}
      color={color}
      onClick={onClick}
      size="small"
      startIcon={icon}
      variant="contained"
    >
      {label}
    </BottomFloatingButtonStyles>
  );
}
