import type { DevModeEnv } from '@codegena/util-dev-mode';

declare const CODEGENA_BUILD_ID: string;

export const appBuildId = import.meta.env.PROD
  ? CODEGENA_BUILD_ID
  : `dev-${crypto.randomUUID()}`;

export const devModeEnv: DevModeEnv = {
  isDevMode: !import.meta.env.PROD,
  isTestingMode: import.meta.env.MODE === 'test',
};
