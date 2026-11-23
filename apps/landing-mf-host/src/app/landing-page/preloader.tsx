import Snackbar from '@mui/material/Snackbar';
import { type ReactElement, useEffect, useState } from 'react';

import { PreloaderLine, SlowConnectionAlert } from './preloader.styles';

export function Preloader(): ReactElement {
  const [showsSlowConnection, setShowsSlowConnection] = useState(false);

  useEffect(() => {
    const warningTimeout = setTimeout(() => setShowsSlowConnection(true), 2000);

    return () => clearTimeout(warningTimeout);
  }, []);

  const renderedWarning = showsSlowConnection && (
    <Snackbar
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      open
      transitionDuration={0}
    >
      <SlowConnectionAlert
        role="status"
        severity="warning"
        variant="filled"
      >
        Your connection still seems slow. Please wait for the page to finish loading.
      </SlowConnectionAlert>
    </Snackbar>
  );

  return (
    <>
      <PreloaderLine
        aria-label="Loading landing content"
        color="info"
      />
      {renderedWarning}
    </>
  );
}
