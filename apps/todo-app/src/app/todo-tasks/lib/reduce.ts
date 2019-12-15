import * as _ from "lodash";

import {
    ActionType,
    ComponentCalculatedData,
    ComponentContext,
    ComponentTruth,
    PositionMove,
    PositionMoveByStep,
    ToDoTaskTeaser
} from "./context";

import { moveItemInArray } from "@angular/cdk/drag-drop";
import {
    addEmptyTaskAfterSelected,
    editTaskInList,
    markTaskInListAs,
    moveTaskInArray,
    moveTaskInArrayByOneStep
} from "./helpers";

export function getDefaultState(): ComponentContext {
    return {
        $$lastAction: null,
        selectedTaskUid: null,
        totalTasksCount: 0
    };
}

/**
 * Reduce context function for {@link ComponentContext}.
 *
 * @param context
 * Previous context
 * @param truth
 * Changed part of "truth" has to be applied in context
 *
 * @return
 * New object with updated context
 */
export function reduce(
    context: ComponentContext,
    truth: ComponentTruth
): ComponentContext {
    switch (truth.$$lastAction) {

        case ActionType.AddNewTaskOptimistic:
            return {
                ...context,
                ...truth,
                selectedTaskUid: context.tasks.length
                    ? context.selectedTaskUid
                    : truth.lastAddedTask.uid,
                tasks: [
                    ...context.tasks,
                    truth.lastAddedTask
                ]
            };

        case ActionType.AddNewEmptyTaskAfterOptimistic:
            return {
                ...context,
                ...truth,
                selectedTaskUid: truth.lastAddedTask.uid,
                tasks: addEmptyTaskAfterSelected(
                    context.tasks,
                    context.selectedTaskUid,
                    truth.lastAddedTask
                )
            };

        case ActionType.ChangeTaskPosition:
            // todo describe API for ChangeGroup and use
            break;

        case ActionType.ChangeTaskPositionOptimistic:

            let affectedTaskUids;

            if ([
                PositionMoveByStep.Down,
                PositionMoveByStep.Up
            ].includes(truth.lastTaskPositionChanging as PositionMoveByStep)) {
                // Move by one position up or down
                affectedTaskUids = moveTaskInArrayByOneStep(
                    context.tasks,
                    context.selectedTaskUid,
                    truth.lastTaskPositionChanging as PositionMoveByStep
                );

            } else {
                // Move from any position to other any position
                const {from, to} = truth.lastTaskPositionChanging as PositionMove;
                affectedTaskUids = moveTaskInArray(context.tasks, from, to);
            }

            return {
                ...context,
                ...truth,
                lastAffectedTaskUIds: affectedTaskUids
            };

        case ActionType.DeleteTaskOptimistic:
            let selectedTaskAfterDelete = context.selectedTaskUid;
            let shouldSelectItemWithIndex: number;

            // change `selectedTaskUid` when it gets deleted
            if (truth.lastDeletedTaskUid === context.selectedTaskUid) {
                shouldSelectItemWithIndex = _.findIndex(
                    context.tasks,
                    (task: ToDoTaskTeaser) => task.uid === context.selectedTaskUid
                );

                if (shouldSelectItemWithIndex === -1) {
                    throw new Error('Can\'t find item with selected uid in list of tasks!');
                }

                if (shouldSelectItemWithIndex > 0) {
                    shouldSelectItemWithIndex--;
                } else if (context.tasks.length === 1) {
                    shouldSelectItemWithIndex = null;
                }
            }

            const tasksAfterDeleting = _.remove(
                context.tasks,
                task => task.uid !== truth.lastDeletedTaskUid
            );

            if (shouldSelectItemWithIndex !== undefined) {
                selectedTaskAfterDelete = tasksAfterDeleting[shouldSelectItemWithIndex]
                    ? tasksAfterDeleting[shouldSelectItemWithIndex].uid
                    : null;
            }

            return {
                ...context,
                ...truth,
                selectedTaskUid: selectedTaskAfterDelete,
                tasks: tasksAfterDeleting
            };

        case ActionType.EditTaskOptimistic:

            const editingTaskUid = truth.lastEditingData.uid
                ? truth.lastEditingData.uid
                : context.selectedTaskUid;

            return {
                ...context,
                ...truth,
                selectedTaskUid: editingTaskUid,
                tasks: editTaskInList(
                    context.tasks,
                    editingTaskUid,
                    truth.lastEditingData
                )
            };

        case ActionType.InitializeWithDefaultState:
        case ActionType.InitializeWithRouteParams:

            return {
                ...context,
                ...truth
            };

        case ActionType.MarkTaskAsDoneOptimistic:
        case ActionType.MarkTaskAsUnDoneOptimistic:

            return {
                ...context,
                ...truth,
                tasks: markTaskInListAs(
                    context.tasks,
                    truth.lastToggledTaskUid,
                    truth.$$lastAction === ActionType.MarkTaskAsDoneOptimistic
                )
            };

        case ActionType.SaveChangedItems:

            return {
                ...context,
                ...truth
            };

        case ActionType.SelectTask:

            return {
                ...context,
                ...truth,
                selectedTaskUid: truth.lastSelectedTaskUid
            };

        default: throw new Error('Unknown action type!');
    }
}

/**
 * Do after every base reducing and do not related
 * with action updates.
 *
 * @param context
 * @return
 */
export function afterReduce(context: ComponentContext): ComponentContext {
    const calculatedData: ComponentCalculatedData = {
        totalTasksCount: (context.tasks || []).length
    };

    return _.assign(context, calculatedData);
}
