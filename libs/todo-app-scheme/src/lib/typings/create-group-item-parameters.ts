/* tslint:disable */
/**
 * Model of parameters for API `/group/{groupId}/item`
 */
export interface CreateGroupItemParameters {
  /**
   * ## UID of element
   * An unique id of task
   */
  groupId: string;
  /**
   * Force save group despite conflicts
   */
  forceSave?: any;
}
