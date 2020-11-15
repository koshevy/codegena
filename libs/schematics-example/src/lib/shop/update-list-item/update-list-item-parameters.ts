/**
 * Model of parameters for API `/list/{listId}/item/{itemId}`
 */
export interface UpdateListItemParameters {
  /**
   * Uid of TODO list
   */
  listId: number;
  /**
   * Uid of TODO list item
   */
  itemId: number;
  /**
   * Force save list despite conflicts
   */
  forceSave?: any;
}
