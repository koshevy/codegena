import _ from 'lodash';
import * as generateUid from 'nanoid';
import Ajv from 'ajv';

import { moveItemInArray } from '@angular/cdk/drag-drop';

import {
    ToDoTask,
    ToDoGroup,
    ToDoTaskBlank,
    /**
     * JSON Schema for validation of tasks.
     */
    schema as TodAppJsonSchema
} from "@codegena/todo-app-scheme";
import {
    PositionMoveByStep,
    TaskEditingData,
    ToDoTaskTeaser
} from './context';

// ***

const avjFactory = new Ajv({
    allErrors: true,
    coerceTypes: false
});
const taskValidator = avjFactory.compile({
    ...TodAppJsonSchema.components.schemas.ToDoGroupBlank,
    components: TodAppJsonSchema.components,
});
const taskBlankValidator = avjFactory.compile({
    ...TodAppJsonSchema.components.schemas.ToDoGroupBlank,
    components: TodAppJsonSchema.components,
});

// *** Component helpers

export function getFullTextOfSelectedTask(
    tasks: ToDoTask[],
    selectedTaskUid: string
): string {
    const currentTask = _.find(
        tasks,
        (task: ToDoTaskTeaser) =>
            task.uid === selectedTaskUid || task.prevTempUid === selectedTaskUid
    );

    let fullText: string;

    if (currentTask) {
        fullText = [
            `<h3>${currentTask.title}</h3>`,
            `${currentTask.description || ''}`
        ].join('\n');
    } else {
        fullText = null;
    }

    return fullText;
}

export function parseFullTextTask(fullText): {
    description: string;
    title: string;
} {
    const matches = /^.*<h3>(.*)<\/h3>.*$/.exec(fullText);
    let title, description;

    if (matches) {
        [ description, title ] = matches;
        description = description.replace(/<h3>.*<\/h3>/g, '');
    } else {
        description = fullText;
    }

    return {
        description,
        title
    };
}

/**
 * Syncs significant statuses of task in two lists:
 * - {@link ToDoTaskTeaser.isInvalid}
 * - {@link ToDoTaskTeaser.isJustCreated}
 * - {@link ToDoTaskTeaser.isPending}
 *
 * @param from
 * @param to
 */
export function syncTasksStatus(
    from: ToDoTaskTeaser[],
    to: ToDoTaskTeaser[]
) {
    _.each(from, (task, i) => {
        if (to[i].uid !== task.uid && to[i].uid !== task.prevTempUid) {
            throw new Error(`Can't sync validation status! Task lists have are not overlapped!`)
        }

        to[i].isInvalid = !!task.isInvalid;
        to[i].isJustCreated = !!task.isJustCreated;
        to[i].isPending = !!task.isPending;
    });
}

// *** Store helpers

/**
 * Add task into list after selected item
 *
 * @param tasks existed list
 * @param selectedTaskUid uid of already selected item
 * @return
 */
export function insertEmptyTaskAfterSelected(
    tasks: ToDoTaskTeaser[],
    selectedTaskUid: string,
    newItem: ToDoTaskTeaser
): ToDoTaskTeaser[] {
    const selectedItemIndex = _.findIndex(
        tasks,
        (task: ToDoTaskTeaser) =>
            task.uid === selectedTaskUid || task.prevTempUid === selectedTaskUid
    );

    if (selectedItemIndex === -1) {
        throw new Error('Can\'t find task with set id!');
    }

    // Clear unused not valid tasks from last time
    // if they are not going to be saved
    tasks = filterTasksWithPositionCollapse(
        tasks,
        task =>
            !task.isInvalid || !task.isJustCreated || !!task.isPending
    );

    const position = (selectedItemIndex < (tasks.length - 1))
        ? tasks[selectedItemIndex + 1].position
        : null;

    // inserts new tasks
    tasks.splice(
        selectedItemIndex + 1, 0,
        { ...newItem, position }
    );


    // also, if task was added not at the end of task list,
    // further items get shifted
    if (position) {
        for(let i = selectedItemIndex + 2; i < tasks.length; i++) {
            tasks[i] = {
                ...tasks[i],
                position: tasks[i].position + 1
            };
        }
    }

    return tasks;
}

export function createNewTaskTeaser(title, groupUid?: string): ToDoTaskTeaser {
    const date = new Date();

    return {
        dateCreated: date.toISOString(),
        dateChanged: date.toISOString(),
        groupUid,
        isDone: false,
        isJustCreated: true,
        position: null,
        title,
        uid: generateUid()
    };
}

export function editTaskInList(
    tasks: ToDoTaskTeaser[],
    selectedItemUid: string,
    editingData: TaskEditingData
): ToDoTaskTeaser[] {
    const selectedTaskIndex = _.findIndex(
        tasks,
        (task: ToDoTaskTeaser) =>
            task.uid === selectedItemUid
    );

    if (selectedTaskIndex === -1) {
        throw new Error('Can\'t find selected task in list!');
    }

    tasks[selectedTaskIndex] = {
        ...tasks[selectedTaskIndex],
        description: (editingData.description !== undefined)
            ? editingData.description
            : tasks[selectedTaskIndex].description,
        title: (editingData.title !== undefined)
            ? editingData.title
            : tasks[selectedTaskIndex].title,
    };

    return [...tasks];
}

export function toggleTaskInList<T extends ToDoTask>(
    tasks: T[],
    uid: string,
    isDone: boolean
): T[] {
    const index = _.findIndex(
        tasks,
        (task: T) => task.uid === uid
    );

    if (index === -1) {
        throw new Error('Can\'t find task with set id!');
    }

    tasks[index] = {
        ...tasks[index],
        isDone
    };

    return tasks;
}

/**
 * Move task in array from one position to other.
 * Mutates `tasks`!
 *
 * @param tasks
 * @param from
 * @param to
 * @return
 * Returns UIDs of affected tasks
 */
export function moveTaskInArray<T extends ToDoTask>(
    tasks: T[],
    from: number,
    to: number
): string[] {
    const affectedUids = [];

    // Move from any position to other any position
    moveItemInArray(tasks, from, to);
    if (from > to) {
        for (let i = to; i < from; i++) {
            affectedUids.push(tasks[i].uid, tasks[i+1].uid);
            swapTasksPositions(tasks, i, i+1);
        }
    } else {
        for (let i = to; i > from; i--) {
            affectedUids.push(tasks[i].uid, tasks[i-1].uid);
            swapTasksPositions(tasks, i, i-1);
        }
    }

    return _.uniq(affectedUids);
}

/**
 * Move selected task up or down in a list.
 * Mutates `tasks`!
 *
 * @param tasks
 * @param selectedItemUid
 * @param direction
 * `PositionMoveByStep.Up` or `PositionMoveByStep.Down`.
 * @return
 * Returns UIDs of affected tasks
 */
export function moveTaskInArrayByOneStep<T extends ToDoTask>(
    tasks: T[],
    selectedItemUid: string,
    direction: PositionMoveByStep
): string[] {
    const from = _.findIndex(
        tasks,
        (item: T) => item.uid === selectedItemUid
    );

    if (from === -1) {
        throw new Error('Can\'t find item with set selectedItemUid!');
    }

    const to = from + ((direction === PositionMoveByStep.Up) ? -1 : 1 );

    if (to < 0 || to >= tasks.length) {
        return;
    }

    moveItemInArray(tasks, from, to);
    swapTasksPositions(tasks, from, to);

    return [tasks[from].uid, tasks[to].uid];
}

/**
 * Changes option `position` of to tasks in array.
 * Mutates array.
 *
 * @param tasks
 * @param from
 * @param to
 */
export function swapTasksPositions(
    tasks: ToDoTask[],
    firstIndex: number,
    secondIndex: number
): void {
    const fromPosition = tasks[firstIndex].position;
    tasks[firstIndex].position = tasks[secondIndex].position;
    tasks[secondIndex].position = fromPosition;
}

/**
 * Get default `groupUid` for new created {@link ToDoTask}
 *
 * @param selectedGroupUids
 * @param tasks
 * @return
 * One default groupUid
 */
export function getDefaultGroupUid(
    selectedGroupUids: string[],
    groups: ToDoGroup[]
): string {
    if (selectedGroupUids && selectedGroupUids.length) {
        return _.first(selectedGroupUids);
    }

    return groups
        ? _.first(groups).uid
        : null;
}

/**
 * Downgrade difference between {@link ToDoTaskTeaser} and {@link ToDoTask}:
 * `ToDoTaskTeaser` have additional temporary UI data but can fail validation
 * when it's gets saved.
 *
 * @param taskTeaser
 * @return
 */
export function downgradeTeaserToTask(
    taskTeaser: ToDoTaskTeaser
): ToDoTask {
    const task = { ...taskTeaser };

    if (!task.description || !task.description.trim()) {
        delete task.description;
    } else {
        task.description = task.description.trim();
    }

    delete task.isJustCreated;
    delete task.isPending;
    delete task.prevTempUid;

    return task;
}

/**
 * Similar to {@link downgradeTeaserToTask}, but for
 * {@link ToDoTaskBlank} — when it's using for first time saving.
 *
 * @param taskTeaser
 * @return
 */
export function downgradeTeaserToTaskBlank(
    taskTeaser: ToDoTaskTeaser
): ToDoTaskBlank {
    const task = downgradeTeaserToTask(taskTeaser) as any;

    delete task.dateChanged;
    delete task.dateCreated;
    delete task.uid;

    if (!task.position) {
        delete task.position;
    }

    return task;
}

export function downgradeTeasersToTasks(
    taskTeasers: ToDoTaskTeaser[]
): ToDoTask[] {
    return _.map(taskTeasers, downgradeTeaserToTask);
}

export function assureTaskUidIsActual(
    uid: string,
    earlyChangedUids: {[prevUid: string]: string}
) {
    return (earlyChangedUids || {})[uid] || uid;
}

/**
 * Updates {@link ToDoTaskTeaser.isInvalid} property of `task`;
 * Mutates object.
 *
 * @param task
 */
export function validateTask(task: ToDoTaskTeaser): void {
    task.isInvalid = task.isJustCreated
        ? !taskBlankValidator(downgradeTeaserToTaskBlank(task))
        : !taskValidator(downgradeTeaserToTask(task));
}

/**
 *
 * @param tasks
 * @param condition
 * @return
 * New array without filtered elements and with collapsed
 * {@link ToDoTaskTeaser.position} of tasks that follow after
 * removed items.
 */
export function filterTasksWithPositionCollapse(
    tasks: ToDoTaskTeaser[],
    condition: (task: ToDoTaskTeaser) => boolean
): ToDoTaskTeaser[] {
    let offset = 0;
    const result = [];

    for (let i = 0; i < tasks.length; i++) {
        const task = offset
            ? { ...tasks[i], position: tasks[i].position - offset }
            : tasks[i];

        if (condition(task)) {
            result.push(task);
        } else {
            offset++;
        }
    }

    console.log('result', result);

    return result;
}
