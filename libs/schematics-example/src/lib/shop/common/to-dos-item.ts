import { ToDosItemBlank } from './to-dos-item-blank';
import { AttachmentMetaImage } from './attachment-meta-image';
import { AttachmentMetaDocument } from './attachment-meta-document';

/**
 * ## Item in todo's list
 * Describe data structure of an item in list of tasks
 */
export interface ToDosItem extends ToDosItemBlank {
  /**
   * An unique id of task
   */
  readonly uid: number;
  /**
   * Date/time (ISO) when task was created
   */
  readonly dateCreated: string;
  /**
   * Date/time (ISO) when task was changed last time
   */
  readonly dateChanged: string;
  /**
   * Position of a task in list. Allows to track changing of state of a concrete
   * item, including changing od position.
   */
  position: number;
  /**
   * An unique id of list that item belongs to
   */
  listUid: number;
  /**
   * Short brief of task to be done
   */
  title: string;
  /**
   * Detailed description and context of the task. Allowed using of Common Markdown.
   */
  description?: string;
  /**
   * Status of task: is done or not
   */
  isDone: boolean;
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
