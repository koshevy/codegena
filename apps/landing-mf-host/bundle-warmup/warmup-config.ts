import type {
  BundleWarmupConfig,
  BundleWarmupExtrasGroups,
} from '@codegena/pwa/bundle-warmup-config';

import config from './bundle-warmup-config.json';

const { clientShellGroup } = config;
const bundleWarmupConfig: BundleWarmupConfig<
  keyof typeof config.warmupGroups.warmAfterPaintedGroups,
  keyof typeof config.warmupGroups.extrasGroups
> = config;

export const csrExtrasGroups: BundleWarmupExtrasGroups<'landingCompletelyLoaded'> = (
  bundleWarmupConfig.warmupGroups.extrasGroups
);
export const ssrExtrasGroups: BundleWarmupExtrasGroups<'landingCompletelyLoaded'> = {
  landingCompletelyLoaded: [clientShellGroup, ...csrExtrasGroups.landingCompletelyLoaded],
};

export default bundleWarmupConfig;
