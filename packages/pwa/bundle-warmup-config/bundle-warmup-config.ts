import type { BundleWarmupGroups } from './bundle-warmup-groups';
import type { BundleWarmupManifestOptions } from './bundle-warmup-manifest-options';

/**
 * Manifest path used by the Service Worker when a warmup request omits it.
 */
export const defaultBundleWarmupManifestPath = 'bundle-warmup.json';

/**
 * An app's settings for emitting a warmup manifest and scheduling
 * its groups. The build supplies its own ID when creating the manifest.
 */
export interface BundleWarmupConfig<
  Navigation extends string = string,
  ExtrasTurn extends string = string,
> extends Readonly<BundleWarmupManifestOptions> {
  /**
   * When to request the named groups defined in `chunkGroups`.
   */
  readonly warmupGroups: BundleWarmupGroups<Navigation, ExtrasTurn>;
}
