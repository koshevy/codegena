import { ToDoTaskBlank } from './to-do-task-blank';
import { AttachmentMetaImage } from './attachment-meta-image';
import { AttachmentMetaDocument } from './attachment-meta-document';

/**
 * ## Item in todo's group
 * Describe data structure of an item in group of tasks
 */
export interface ToDoTask extends ToDoTaskBlank {
    /**
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
     * Position of a task in group. Allows to track changing of state of a concrete
     * item, including changing od position.
     */
    position: null | number;
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
     * Any material attached to the task: may be screenshots, photos, pdf- or doc-
     * documents on something else
     */
    attachments?: null | Array<
        | AttachmentMetaImage // Meta data of image attached to task
        | AttachmentMetaDocument // Meta data of document attached to task
        | string // Link to any external resource
    >;
}
