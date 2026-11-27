import { DevModeEnvContext } from '@codegena/util-dev-mode';
import type { Decorator } from '@storybook/react';

import { appBuildId, devModeEnv } from './environment';

export const withAppBuildId: Decorator = (Story, context) => (
  <DevModeEnvContext.Provider value={devModeEnv}>
    <Story args={{ ...context.args, appBuildId }} />
  </DevModeEnvContext.Provider>
);
