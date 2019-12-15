/**
 * Types of events, {@link TaskListComponent} can emit through their outputs.
 */
export enum TaskListEventType {
    FocusDelegated,
    TaskAdded,
    TaskAddedAfterSelected,
    TaskChanged,
    TaskDeleted,
    TaskGotFocus,
    TaskMoved,
    TaskMovedUp,
    TaskMovedDown,
    TaskToggled
}

/**
 * This is "chameleon's" typing able to forming dependents on `type`.
 * It's very helpful when we have flat structure common for few action types,
 * and each of them have own required parameters.
 */
export type TaskListEventData<T extends TaskListEventType = TaskListEventType> =
    T extends | TaskListEventType.FocusDelegated
              | TaskListEventType.TaskDeleted
              | TaskListEventType.TaskGotFocus
              | TaskListEventType.TaskMovedUp
              | TaskListEventType.TaskMovedDown
            ? {
                type: T;
                uid: string;
            } :
    T extends | TaskListEventType.TaskAdded
              | TaskListEventType.TaskAddedAfterSelected
            ? {
                type: T;
                title: string;
            } :
    T extends | TaskListEventType.TaskChanged
            ? {
                type: T;
                uid: string;
                title: string;
            } :
    T extends | TaskListEventType.TaskMoved
            ? {
                type: T;
                from: number;
                to: number;
            } :
            {
                type: TaskListEventType.TaskToggled;
                uid: string;
                isDone: boolean;
            };
