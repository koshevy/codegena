import { setPreloadingStateOff } from '@codegena/ui-theme';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Link from '@mui/material/Link';
import { type ReactElement, useLayoutEffect } from 'react';
import { useRouteError } from 'react-router-dom';

import { HostLink } from '../navigation';

export function RouteError(): ReactElement {
  const error = useRouteError();
  const message = error instanceof Error
    ? error.message
    : 'The page could not be loaded.';

  useLayoutEffect(setPreloadingStateOff, []);

  return (
    <Alert severity="error">
      <AlertTitle>Unable to open this page</AlertTitle>
      {message}
      <Link
        component={HostLink}
        href="/"
      >
        Return to landing
      </Link>
    </Alert>
  );
}
