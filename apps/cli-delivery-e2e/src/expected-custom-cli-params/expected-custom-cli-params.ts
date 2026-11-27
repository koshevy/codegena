export interface ExpectedCustomCliParams {
  /**
   * Enable the Windows smoke test and build its Compose service.
   */
  dontSkipTestsForWindows?: boolean;
  /**
   * Keep the Compose project running after Jest exits for debugging.
   */
  skipShootDownVirtualFs?: boolean;
}
