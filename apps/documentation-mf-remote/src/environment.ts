import type { DevModeEnv } from '@codegena/util-dev-mode';

declare const CODEGENA_BUILD_ID: string;

export const appBuildId = process.env['NODE_ENV'] === 'production'
  ? CODEGENA_BUILD_ID
  : `dev-${crypto.randomUUID()}`;

const searchParams = new URLSearchParams(
  typeof window === 'undefined' ? '' : window.location.search,
);

export const devModeEnv: DevModeEnv = {
  isDevMode: process.env['NODE_ENV'] !== 'production',
  // Enable deterministic behavior for predictable tests, including visual checks.
  isTestingMode: process.env['NODE_ENV'] === 'test'
    || searchParams.get('testingMode') === 'true',
};
