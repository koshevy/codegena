import {
    ToDoTask,
    ToDoTaskBlank,
    ToDoGroup
} from '@codegena/todo-app-scheme';

export { GlobalPartial as Partial } from 'lodash/common/common';

export const enum ActionType {
    // Initialize state
    InitializeWithDefaultState = '[Initialize task list with default state]',
    InitializeWithRouteParams = '[Initialize task list with route params]',
    // Change state
    AddNewTask = '[Add new task]',
    // This is what happens once you press Shift+Enter
    AddNewEmptyTaskAfter = '[Add new empty task after selected]',
    EditTask = '[Edit task]',
    ChangeTaskPosition = '[Change task position]',
    DeleteTask = '[Delete task]',
    SelectTask = '[Select task]',
    SaveChangedTasks = '[Save changed items]',
    MarksChangedTasksAsPending = '[Marks changed tasks as pending]',
    MarkTaskAsDone = '[Mark task as done]',
    MarkTaskAsUnDone = '[Mark task as undone]',
}

export interface ToDoTaskTeaser<IsJustCreated extends boolean = boolean> extends ToDoTask {
    isInvalid?: boolean;

    /**
     * Means this task just created, has temporary uid
     * and not saved yet.
     */
    isJustCreated?: IsJustCreated;

    /**
     * Means this task is saving now.
     */
    isPending?: boolean;

    /**
     * Previous uid of task temporary assigned until
     * it gets saved and gets new UID from backend.
     */
    prevTempUid?: string;

    /**
     * Just created objects of type `ToDoTaskTeaser`
     * may skip `position` because should be converted to `ToDoTaskBlank`
     * before first save, but not to `ToDoTask`.
     */
    position: IsJustCreated extends true
        ? number | null
        : number;
}

export interface TaskEditingData {
    description?: string;
    title?: string;
    uid: string;
}

export interface PositionMove {
    from: number;
    to: number;
}

export const enum PositionMoveByStep {
    Up = 'Up',
    Down = 'Down'
}

export type PositionChanging = PositionMove | PositionMoveByStep;

export interface ComponentTruth {

    /**
     * TYPE OF ACTION:
     * flat property in context intended to do identification of action.
     *
     */
    $$lastAction: ActionType | null;

    groups?: ToDoGroup[];
    lastAddedTask?: ToDoTaskTeaser;
    lastAffectedTaskUIds?: string[];
    lastBufferedChangedTasks?: ToDoTaskTeaser[];
    lastDeletedTaskUid?: string;
    lastEditingData?: TaskEditingData;
    lastSelectedTaskUid?: string;
    lastTaskPositionChanging?: PositionChanging;
    lastToggledTaskUid?: string;
    selectedGroupUids?: string[];
    tasks?: ToDoTaskTeaser[];
}

/**
 * Properties have to be calculated automatically after
 * each action-inducted reducing.
 */
export interface ComponentCalculatedData {
    hasInvalidTasks: boolean;
    totalTasksCount: number;
}

export interface ComponentContext
    extends ComponentTruth,
            ComponentCalculatedData {

    /**
     * New tasks get created in front end app with UID also created on FE side.
     * But after task saved, backend assign new UID.
     *
     * This property stores all replacements of UID and helps
     * to recognize UID's in payload of actions, emitted before new task saved,
     * but not complete yet.
     */
    earlyCreatedTaskUids?: {
        [oldUid: string]: string
    };

    /**
     * UID task in list, marked as "selected"
     */
    selectedTaskUid: string | null;
}
