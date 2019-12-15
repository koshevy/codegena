import { ToDoGroup } from '@codegena/todo-app-scheme';

export { GlobalPartial as Partial } from 'lodash/common/common';

export const enum ActionType {
    AddNewGroup = '[Add new group]',
    AddNewGroupOptimistic = '[Add new group (optimistic)]',
    ClearAllDone = '[Clear all done tasks]',
    CancelCreation = '[Cancel creation]',
    CancelUpdating = '[Cancel updating]',
    ChangeGroupPosition = '[Change group position]',
    ChangeGroupPositionOptimistic = '[Change group position (optimistic)]',
    DeleteItem = '[Delete item]',
    DeleteItemOptimistic = '[Delete item (optimistic)]',
    EditGroup = '[Edit group]',
    EditGroupOptimistic = '[Edit group (optimistic)]',
    InitializeWithRouteParams = '[Initialize with route params]',
    MarkAllAsDone = '[Mark all items as done]',
    MarkAllAsDoneOptimistic = '[Mark all items as done (optimistic)]',
    MarkAllAsUndone = '[Mark all items as undone]',
    MarkAllAsUndoneOptimistic = '[Mark all items as undone (optimistic)]',
    MarkGroupAsDone = '[Mark group items as undone]',
    MarkGroupAsDoneOptimistic = '[Mark group items as done (optimistic)]',
    MarkGroupAsUndone = '[Mark group items as undone]',
    MarkGroupAsUndoneOptimistic = '[Mark group items as undone (optimistic)]'
}

/**
 * Teaser of ToDo group in common group of this component.
 * Shows both of already created and new optimistically added,
 * but not created yet in fact.
 */
export interface ToDoGroupTeaser extends ToDoGroup {
    countOfDone: number;
    totalCount: number;
    /**
     * Marks this item added to groups optimistically.
     */
    optimistic?: boolean;

    /**
     * Marks this item was failed during adding
     */
    failed?: boolean;

    /**
     * Marks this item have been removing
     */
    removing?: boolean;
}

export interface ComponentTruth {

    /**
     * TYPE OF ACTION:
     * flat property in context intended to do identification of action.
     */
    $$lastAction: ActionType;

    isComplete: boolean | null;

    /**
     * todo I don't now what is it. it better to remove
     */
    isCurrentGroup: number | null;

    /**
     * Should dialog be opened?
     */
    isCreateGroupModalOpen?: boolean;

    createdGroup?: ToDoGroup;

    /**
     * Temporary `uid` that `createdGroup` had before
     * it appropriated after success creation.
     * Helps replace temporary optimistic group by group
     * with new `uid`, obtained from server.
     */
    createdGroupPrevUid?: string;

    editedGroup?: ToDoGroup;

    /**
     * List of groups of tasks.
     * Initializes in middleware and uses as an argument
     * for some type of actions.
     */
    groups?: ToDoGroupTeaser[];

    positionChanging?: { from: number; to: number };

    /**
     * Parameter of removing action.
     * Gets to be `ToDoGroup` at dispatching, and
     * gets to transform after middleware processing.
     */
    removedGroup?: ToDoGroup | ToDoGroupTeaser;
}

/**
 * Properties have to be calculated automatically after
 * each action-inducted reducing.
 */
export interface ComponentCalculatedData {
    areAllComplete?: boolean;
    areAllIncomplete?: boolean;
    summaryTaskCount?: number;
    summaryTaskDoneCount?: number;
    summaryGroupCount?: number;
}

export interface ComponentContext extends ComponentTruth, ComponentCalculatedData {
    /**
     * Bottom panel should be disabled when some processes are going.
     */
    isBottomPanelDisabled?: boolean;

    /**
     * Mark component as not initialized, because no internet
     */
    noInternetError?: boolean;
}
