import { ToDosItem } from './to-dos-item';

/**
 * ## Base part of data of list
 * Data needed for list creation
 */
export interface ToDosListBlank {
  /**
   * Title of a list
   */
  title: string;
  /**
   * Detailed description of a list. Allowed using of Common Markdown.
   */
  description?: string;
  items: Array<ToDosItem>;
  /**
   * Whether all tasks in list are complete
   */
  isComplete: boolean;
}
