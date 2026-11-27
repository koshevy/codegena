import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

import { RouteLoadingStyles } from './route-loading.styles';

interface RouteLoadingProps {
  label: string;
}

export function RouteLoading({ label }: RouteLoadingProps): ReactElement {
  return (
    <RouteLoadingStyles
      aria-label={label}
      role="status"
    >
      <CircularProgress aria-hidden />
      <Typography>{label}</Typography>
    </RouteLoadingStyles>
  );
}
