import { DevModeEnvContext } from '@codegena/util-dev-mode';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App, createAppRouter } from './app';
import { appBuildId, devModeEnv } from './environment';

const router = createAppRouter(appBuildId);

const container = document.getElementById('root');

if (!container) {
  throw new Error('#root element not found');
}

createRoot(container).render(
  <StrictMode>
    <DevModeEnvContext.Provider value={devModeEnv}>
      <App router={router} />
    </DevModeEnvContext.Provider>
  </StrictMode>,
);
