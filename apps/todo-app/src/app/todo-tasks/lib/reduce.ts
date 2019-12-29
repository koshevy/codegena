import _ from "lodash";

import {
    ActionType,
    ComponentCalculatedData,
    ComponentContext,
    ComponentTruth,
    PositionMove,
    PositionMoveByStep,
    ToDoTaskTeaser
} from "./context";

import {
    assureTaskUidIsActual,
    editTaskInList,
    filterTasksWithPositionCollapse,
    getDefaultGroupUid,
    insertEmptyTaskAfterSelected,
    moveTaskInArray,
    moveTaskInArrayByOneStep,
    toggleTaskInList,
    validateTask
} from "./helpers";

export function getDefaultState(): ComponentContext {
    return {
        $$lastAction: null,
        hasInvalidTasks: false,
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

        case ActionType.AddNewTask:
            return {
                ...context,
                ...truth,
                selectedTaskUid: context.tasks.length
                    ? context.selectedTaskUid
                    : truth.lastAddedTask.uid,
                tasks: [
                    ...context.tasks,
                    {
                        ...truth.lastAddedTask,
                        groupUid: getDefaultGroupUid(
                            context.selectedGroupUids,
                            context.groups
                        )
                    }
                ]
            };

        case ActionType.AddNewEmptyTaskAfter:
            return {
                ...context,
                ...truth,
                selectedTaskUid: truth.lastAddedTask.uid,
                tasks: insertEmptyTaskAfterSelected(
                    context.tasks,
                    context.selectedTaskUid,
                    {
                        ...truth.lastAddedTask,
                        groupUid: getDefaultGroupUid(
                            context.selectedGroupUids,
                            context.groups
                        )
                    }
                )
            };

        case ActionType.ChangeTaskPosition:

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

        case ActionType.DeleteTask:
            let selectedTaskAfterDelete = context.selectedTaskUid;
            let indexOfNewSelectedTask: number;

            // change `selectedTaskUid` when it gets deleted
            if (truth.lastDeletedTaskUid === context.selectedTaskUid) {
                indexOfNewSelectedTask = _.findIndex(
                    context.tasks,
                    (task: ToDoTaskTeaser) => task.uid === context.selectedTaskUid
                );

                if (indexOfNewSelectedTask === -1) {
                    throw new Error('Can\'t find item with selected uid in list of tasks!');
                }

                if (indexOfNewSelectedTask > 0) {
                    indexOfNewSelectedTask--;
                } else if (context.tasks.length === 1) {
                    indexOfNewSelectedTask = null;
                }
            }

            const tasksAfterDeleting = filterTasksWithPositionCollapse(
                context.tasks,
                task => task.uid !== truth.lastDeletedTaskUid
            );

            if (indexOfNewSelectedTask !== undefined) {
                selectedTaskAfterDelete = tasksAfterDeleting[indexOfNewSelectedTask]
                    ? tasksAfterDeleting[indexOfNewSelectedTask].uid
                    : null;
            }

            return {
                ...context,
                ...truth,
                selectedTaskUid: selectedTaskAfterDelete,
                tasks: tasksAfterDeleting
            };

        case ActionType.EditTask:

            let editingTaskUid = truth.lastEditingData.uid
                ? truth.lastEditingData.uid
                : context.selectedTaskUid;

            editingTaskUid = assureTaskUidIsActual(
                editingTaskUid,
                context.earlyCreatedTaskUids
            );

            return {
                ...context,
                ...truth,
                lastEditingData: {
                    ...truth.lastEditingData,
                    uid: editingTaskUid
                },
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

        case ActionType.MarksChangedTasksAsPending:

            const bufferedUids = _.map<ToDoTaskTeaser, string>(
                truth.lastBufferedChangedTasks,
                task => task.uid
            );

            const tasks = _.map(context.tasks, (task, index) => {
                if (_.includes(bufferedUids, task.uid)) {
                    return {
                        ...task,
                        isPending: true
                    }
                }

                return task;
            });

            return {
                ...context,
                ...truth,
                tasks
            };

        case ActionType.MarkTaskAsDone:
        case ActionType.MarkTaskAsUnDone:

            let tasksWithUpdatedStatus: ToDoTaskTeaser[];

            try {
                tasksWithUpdatedStatus = toggleTaskInList(
                    context.tasks,
                    truth.lastToggledTaskUid,
                    truth.$$lastAction === ActionType.MarkTaskAsDone
                )
            } catch(err) {
                console.warn('Error occured on task update');
                console.warn(err);

                tasksWithUpdatedStatus = context.tasks;
            }

            return {
                ...context,
                ...truth,
                tasks: tasksWithUpdatedStatus
            };

        case ActionType.SaveChangedTasks:

            const updatedTasks = context.tasks;
            const earlyCreatedTaskUids = context.earlyCreatedTaskUids || {};

            // apply changed UIDs for early created and saved at first time
            _.each(
                truth.lastBufferedChangedTasks,
                savedTask => {
                    if (!savedTask.prevTempUid) {
                        return;
                    }

                    const index = _.findIndex(
                        updatedTasks,
                        task => task.uid === savedTask.prevTempUid
                    );

                    // registration information about temporary UID
                    if (index !== -1) {
                        updatedTasks[index] = savedTask;
                    }
                    // replacing temporary task record with new already saved
                    if (!earlyCreatedTaskUids[savedTask.prevTempUid]) {
                        earlyCreatedTaskUids[savedTask.prevTempUid] = savedTask.uid;
                    }
                }
            );

            return {
                ...context,
                ...truth,
                tasks: updatedTasks,
                earlyCreatedTaskUids
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
    validateTasksInContext(context);

    return _.assign(context, {
        totalTasksCount: (context.tasks || []).length,
        hasInvalidTasks: !!_.find(
            context.tasks || [],
            task => task.isInvalid
        )
    } as ComponentCalculatedData);
}

/**
 * Iterates over tasks changed in last action and do validation of them.
 * @param context
 */
function validateTasksInContext(context: ComponentContext): void {
    let changedTask, changedTaskUid;
    switch (context.$$lastAction) {
        case ActionType.AddNewEmptyTaskAfter:
        case ActionType.AddNewTask:
            changedTaskUid = context.lastAddedTask.uid;
            break;

        case ActionType.EditTask:
            // concrete UID could be set or supposed to be the `selectedTaskUid`
            changedTaskUid = context.lastEditingData.uid
                || context.selectedTaskUid;
    }

    if (changedTaskUid) {
        changedTask = _.find(context.tasks, task =>
            task.uid === changedTaskUid
        );
    }

    if(changedTask) {
        validateTask(changedTask);
    }
}
