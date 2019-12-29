/* tslint:disable */
import { AttachmentMetaDocument } from './attachment-meta-document';
import { AttachmentMetaImage } from './attachment-meta-image';
import { ToDoTaskBlank } from './to-do-task-blank';

/**
 * ## Item in todo's group
 * Describe data structure of an item in group of tasks
 */
export interface ToDoTask extends ToDoTaskBlank {
  /**
   * ## UID of element
   * An unique id of task
   */
  readonly uid: string;
  /**
   * Date/time (ISO) when task was created
   */
  readonly dateCreated: string;
  /**
   * Date/time (ISO) when task was changed last time
   */
  readonly dateChanged: string;
  /**
   * ## UID of element
   */
  groupUid?: string;
  /**
   * Short brief of task to be done
   */
  title: string;
  /**
   * Detailed description and context of the task. Allowed using of Common Markdown.
   */
  description?: any;
  /**
   * Status of task: is done or not
   */
  isDone: boolean;
  /**
   * Position of a task in group. Allows to track changing of state of a concrete
   * item, including changing od position.
   */
  position?: number;
  /**
   * Any material attached to the task: may be screenshots, photos, pdf- or doc-
   * documents on something else
   */
  attachments?: Array<
    | AttachmentMetaImage // Meta data of image attached to task
    | AttachmentMetaDocument // Meta data of document attached to task
    | string // Link to any external resource
  >;
}
