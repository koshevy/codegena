import { createContext } from 'react';

import type { DevModeEnv } from './dev-mode-env';

/**
 * App startup overrides these defaults for production and test runs.
 * Federated apps share this context instead of detecting mode again.
 */
export const DevModeEnvContext = createContext<DevModeEnv>({
  isDevMode: true,
  isTestingMode: false,
});
