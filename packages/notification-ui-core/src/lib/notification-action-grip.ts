export interface NotificationActionGrip {
  /**
   * Implementation of `close()` has to be passed
   * with closing reason `'dismiss'`.
   *
   * @param closedBy
   * Optional arbitrary label to identify a reason of closing
   */
  close(closedBy?: string): void;

  /**
   * Implementation of `closeAll()` has to be passed
   * with closing reason `'revoke'`.
   *
   * @param closedBy
   * Optional arbitrary label to identify a reason of closing
   */
  closeAll(closedBy?: string): void;
}
