import Tooltip from '@mui/material/Tooltip';
import type { ReactElement } from 'react';

import type { HeaderIconButtonProps } from './header-icon-button.props';
import {
  HeaderIconButtonStyles,
  HeaderIconLinkStyles,
} from './header-icon-button.styles';

export function HeaderIconButton({
  expanded,
  href,
  icon,
  label,
  onClick,
  target,
}: HeaderIconButtonProps): ReactElement {
  if (href) {
    const linkRel = target === '_blank' ? 'noopener noreferrer' : undefined;

    return (
      <Tooltip title={label}>
        <HeaderIconLinkStyles
          aria-label={label}
          href={href}
          rel={linkRel}
          target={target}
        >
          {icon}
        </HeaderIconLinkStyles>
      </Tooltip>
    );
  }

  const hasMenu = expanded !== undefined;
  const popupType = hasMenu ? 'menu' : undefined;

  return (
    <Tooltip title={label}>
      <HeaderIconButtonStyles
        aria-expanded={expanded}
        aria-haspopup={popupType}
        aria-label={label}
        onClick={onClick}
      >
        {icon}
      </HeaderIconButtonStyles>
    </Tooltip>
  );
}
