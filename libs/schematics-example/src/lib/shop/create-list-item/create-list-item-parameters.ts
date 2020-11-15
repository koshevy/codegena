/**
 * Model of parameters for API `/list/{listId}/item`
 */
export interface CreateListItemParameters {
  /**
   * Uid of TODO list
   */
  listId: number;
  /**
   * Force save list despite conflicts
   */
  forceSave?: any;
}
