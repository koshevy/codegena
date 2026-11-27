import type { AlertProps } from '@mui/material/Alert';
import type { ReactElement } from 'react';

import type { DocsAlertColor } from './docs-alert-color';
import { DocsAlertStyles } from './docs-alert.styles';

export interface DocsAlertProps extends Omit<AlertProps, 'color'> {
  color?: DocsAlertColor;
}

export function DocsAlert({
  color,
  severity = 'info',
  ...alertProps
}: DocsAlertProps): ReactElement {
  return (
    <DocsAlertStyles
      {...alertProps}
      severity={severity}
      tone={color ?? severity}
    />
  );
}
