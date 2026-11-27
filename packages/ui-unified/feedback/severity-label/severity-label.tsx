import { WarningIcon } from '@codegena/ui-unified/icons';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CircleCheck, CircleX, Info } from 'lucide-react';
import type { ReactElement } from 'react';

import type { SeverityLabelProps } from './severity-label.props';
import { SeverityLabelStyles } from './severity-label.styles';

const iconsBySeverity = {
  error: CircleX,
  info: Info,
  success: CircleCheck,
  warning: WarningIcon,
} as const;

export function SeverityLabel({
  label,
  severity,
}: SeverityLabelProps): ReactElement {
  const theme = useTheme();

  const Icon = iconsBySeverity[severity];
  const renderedIcon = (
    <Icon
      aria-hidden
      size={15}
    />
  );

  return (
    <SeverityLabelStyles
      sx={{ color: theme.palette[severity].dark }}
    >
      {renderedIcon}
      <Typography
        color="inherit"
        component="span"
        variant="caption"
      >
        {label}
      </Typography>
    </SeverityLabelStyles>
  );
}
