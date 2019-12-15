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
    AddNewTaskOptimistic = '[Add new task optimistic]',
    // This is what happens once you press Shift+Enter
    AddNewEmptyTaskAfterOptimistic = '[Add new empty task after selected optimistic]',
    EditTaskOptimistic = '[Edit task optimistic]',
    ChangeTaskPosition = '[Change task position]',
    ChangeTaskPositionOptimistic = '[Change task position optimistic]',
    DeleteTaskOptimistic = '[Delete task optimistic]',
    SelectTask = '[Select task]',
    SaveChangedItems = '[Save changed items]',
    MarkTaskAsDoneOptimistic = '[Mark task as done optimistic]',
    MarkTaskAsUnDoneOptimistic = '[Mark task as undone optimistic]',
}

export interface ToDoTaskTeaser extends ToDoTask {
    /**
     * Marks this item was failed during adding
     */
    failed?: boolean;

    /**
     * Marks this item added to groups optimistically.
     */
    optimistic?: boolean;

    pending?: boolean;
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
    groupPositionChanging?: PositionChanging;
    lastAddedTask?: ToDoTaskTeaser;
    lastAffectedTaskUIds?: string[];
    lastBufferedChangedTasks?: ToDoTask[];
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
    totalTasksCount: number;
}

export interface ComponentContext
    extends ComponentTruth,
            ComponentCalculatedData {

    /**
     * UID task in list, marked as "selected"
     */
    selectedTaskUid: string | null;
}
