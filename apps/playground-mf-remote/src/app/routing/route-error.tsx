import Alert from '@mui/material/Alert';
import type { ReactElement } from 'react';
import { useRouteError } from 'react-router-dom';

export function RouteError(): ReactElement {
  const error = useRouteError();
  const message = error instanceof Error
    ? error.message
    : 'Specification could not load.';

  return <Alert severity="error">{message}</Alert>;
}
