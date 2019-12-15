/* tslint:disable */
/**
 * Model of parameters for API `/group/{groupId}/item`
 */
export interface GetGroupItemsParameters {
  /**
   * ## UID of element
   * An unique id of task
   */
  groupId: string;
  /**
   * Filter groups by `complete` status
   */
  isComplete?: any;
}
