/* tslint:disable */
/**
 * Model of parameters for API `/group/{groupId}/item/{itemId}`
 */
export interface UpdateGroupItemParameters {
  /**
   * ## UID of element
   * An unique id of task
   */
  groupId: string;
  /**
   * ## UID of element
   * An unique id of task
   */
  itemId: string;
  /**
   * Force save group despite conflicts
   */
  forceSave?: any;
}
