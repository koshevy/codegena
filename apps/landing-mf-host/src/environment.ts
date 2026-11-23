import type { BundleWarmupRuntime } from '@codegena/pwa/bundle-warmup-context';
import type { DevModeEnv } from '@codegena/util-dev-mode';

import bundleWarmupConfig, { csrExtrasGroups, ssrExtrasGroups } from '../bundle-warmup';

declare const CODEGENA_BUILD_ID: string;

export const appBuildId = process.env['NODE_ENV'] === 'production'
  ? CODEGENA_BUILD_ID
  : `dev-${crypto.randomUUID()}`;

const searchParams = new URLSearchParams(window.location.search);

export const devModeEnv: DevModeEnv = {
  isDevMode: process.env['NODE_ENV'] !== 'production',
  // Enable deterministic behavior for predictable tests, including visual checks.
  isTestingMode: process.env['NODE_ENV'] === 'test'
    || searchParams.get('testingMode') === 'true',
};

export const { warmAfterPaintedGroups } = bundleWarmupConfig.warmupGroups;
export { csrExtrasGroups, ssrExtrasGroups };

export const bundleWarmupRuntime: BundleWarmupRuntime = {
  buildId: appBuildId,
  canWarmBundles: !devModeEnv.isDevMode,
  manifestPath: bundleWarmupConfig.manifestPath,
};
