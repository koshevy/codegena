/**
 * Build inputs that resolve to the JavaScript and CSS URLs of one manifest group.
 */
export interface BundleWarmupChunkGroup {
  /**
   * Names of the compilation's chunk groups.
   */
  chunks: readonly string[];
  /**
   * Prefix for additional emitted JavaScript and CSS files, such as a copied reset.
   */
  assetPrefix?: string;
  /**
   * Name of a Module Federation expose. Includes its remote entry and synchronous assets.
   */
  remoteExpose?: string;
}

/**
 * Build settings for generating the manifest consumed by the Service Worker.
 */
export interface BundleWarmupManifestOptions {
  /**
   * Input groups keyed by the names an app requests at runtime.
   */
  chunkGroups: Readonly<Record<string, BundleWarmupChunkGroup>>;
  /**
   * Group whose files must already be cached before requesting a
   * client-only home response.
   */
  clientShellGroup?: string;
  /**
   * Output path of the warmup manifest, relative to the build root.
   */
  manifestPath: string;
  /**
   * Output path of the copied Module Federation manifest for groups with a remote expose.
   */
  remotePath?: string;
}
