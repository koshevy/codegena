/**
 * Execution flags supplied by app startup, independently of UI theme.
 */
export interface DevModeEnv {
  isDevMode: boolean;
  /** Enables deterministic behavior for predictable tests. */
  isTestingMode: boolean;
}
