/**
 * Model of parameters for API `/list/{listId}`
 */
export interface UpdateListParameters {
  /**
   * Uid of TODO list
   */
  listId: number;
  /**
   * Force save list despite conflicts
   */
  forceSave?: any;
}
