import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

import type { SeverityCardProps } from './severity-card.props';
import { severityCardClasses, SeverityCardStyles } from './severity-card.styles';

export function SeverityCard({
  ariaLabel,
  children,
  heading,
  message,
  onContextMenu,
  ref,
  severity,
}: SeverityCardProps): ReactElement {
  return (
    <SeverityCardStyles
      aria-label={ariaLabel}
      component="article"
      onContextMenu={onContextMenu}
      ref={ref}
      severity={severity}
    >
      {heading}
      <Typography
        className={severityCardClasses.message}
        variant="body2"
      >
        {message}
      </Typography>
      {children}
    </SeverityCardStyles>
  );
}
