import { type DevModeEnv, DevModeEnvContext } from '@codegena/util-dev-mode';
import CssBaseline from '@mui/material/CssBaseline';
import type { ReactElement, ReactNode } from 'react';

import { AppearanceProvider } from './appearance';

interface AppProvidersProps {
  children: ReactNode;
  devModeEnv: DevModeEnv;
}

export function AppProviders({ children, devModeEnv }: AppProvidersProps): ReactElement {
  return (
    <AppearanceProvider>
      <DevModeEnvContext.Provider value={devModeEnv}>
        <CssBaseline />
        {children}
      </DevModeEnvContext.Provider>
    </AppearanceProvider>
  );
}
