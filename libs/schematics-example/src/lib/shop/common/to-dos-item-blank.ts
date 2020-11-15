import { AttachmentMetaImage } from './attachment-meta-image';
import { AttachmentMetaDocument } from './attachment-meta-document';

/**
 * ## Base part of data of item in todo's list
 * Data about list item needed for creation of it
 */
export interface ToDosItemBlank {
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
  /**
   * Position of a task in list. Allows to track changing of state of a concrete
   * item, including changing od position.
   */
  position?: number;
}
