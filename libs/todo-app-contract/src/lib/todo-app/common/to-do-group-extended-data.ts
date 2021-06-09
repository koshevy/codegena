import { ToDoTask } from './to-do-task';

/**
 * ## Extended data of group
 * Extended data has to be obtained after first save
 */
export interface ToDoGroupExtendedData {
    /**
     * An unique id of task
     */
    uid: string;
    /**
     * Date/time (ISO) when task was created
     */
    dateCreated: string;
    /**
     * Date/time (ISO) when task was changed last time
     */
    dateChanged: string;
    items: Array<ToDoTask>;
}
