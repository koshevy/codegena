export interface BundleWarmupRuntime {
  readonly buildId: string;
  readonly canWarmBundles: boolean;
  readonly manifestPath?: string;
}
