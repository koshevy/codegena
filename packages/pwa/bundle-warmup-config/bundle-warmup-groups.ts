/**
 * The ordered manifest groups to warm after the first paint for each
 * navigation key. Applications choose the keys from their own routes.
 */
export type NavigationWarmupGroups<Navigation extends string = string> = Readonly<
  Record<Navigation, readonly string[]>
>;

/**
 * The ordered manifest groups to warm when each named extras turn becomes
 * ready. The warmup session handles each turn once.
 */
export type BundleWarmupExtrasGroups<ExtrasTurn extends string = string> = Readonly<
  Record<ExtrasTurn, readonly string[]>
>;

/**
 * A route layout's two warmup schedules. The app selects the
 * navigation key and signals when an extras turn is ready.
 */
export interface BundleWarmupGroups<
  Navigation extends string = string,
  ExtrasTurn extends string = string,
> {
  readonly warmAfterPaintedGroups: NavigationWarmupGroups<Navigation>;
  readonly extrasGroups: BundleWarmupExtrasGroups<ExtrasTurn>;
}
