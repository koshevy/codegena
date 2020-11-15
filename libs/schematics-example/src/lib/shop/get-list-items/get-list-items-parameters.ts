/**
 * Model of parameters for API `/list/{listId}/item`
 */
export interface GetListItemsParameters {
  /**
   * Uid of TODO list
   */
  listId: number;
  /**
   * Filter lists by `complete` status
   */
  isComplete?: any;
}
