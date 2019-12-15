/* tslint:disable */
import { ToDoTaskBlank } from './to-do-task-blank';

/**
 * ## Base part of data of group
 * Data needed for group creation
 */
export interface ToDoGroupBlank {
  /**
   * Title of a group
   */
  title: string;
  /**
   * Detailed description of a group in one/two sequences.
   */
  description?: string;
  items?: Array<ToDoTaskBlank>;
  /**
   * Whether all tasks in group are complete
   */
  isComplete?: boolean;
}
