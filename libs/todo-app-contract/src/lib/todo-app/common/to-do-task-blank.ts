import { AttachmentMetaImage } from './attachment-meta-image';
import { AttachmentMetaDocument } from './attachment-meta-document';

/**
 * ## Base part of data of item in todo's group
 * Data about group item needed for creation of it
 */
export interface ToDoTaskBlank {
    /**
     * An unique id of group that item belongs to
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
    position?: null | number;
    /**
     * Any material attached to the task: may be screenshots, photos, pdf- or doc-
     * documents on something else
     */
    attachments?: null | Array<
        | AttachmentMetaImage // Meta data of image attached to task
        | AttachmentMetaDocument // Meta data of document attached to task
        | string // Link to any external resource
    >;
}
