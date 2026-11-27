import type { DevModeEnv } from '@codegena/util-dev-mode';
import type { ReactElement } from 'react';
import { RouterProvider, type RouterProviderProps } from 'react-router-dom';

import { AppProviders } from './app-providers';

interface AppProps {
  router: RouterProviderProps['router'];
  devModeEnv: DevModeEnv;
}

export function App({ router, devModeEnv }: AppProps): ReactElement {
  return (
    <AppProviders devModeEnv={devModeEnv}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
