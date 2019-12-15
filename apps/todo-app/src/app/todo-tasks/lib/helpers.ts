import _ from 'lodash';
import { moveItemInArray } from '@angular/cdk/drag-drop';

import { ToDoTask, ToDoGroup } from '@codegena/todo-app-scheme';
import {
    PositionMoveByStep,
    TaskEditingData,
    ToDoTaskTeaser
} from './context';

let newBlankUidCounter = 0;

// *** Component helpers

export function getFullTextOfSelectedTask(
    tasks: ToDoTask[],
    selectedTaskUid: string
): string {
    const currentTask = _.find(
        tasks,
        (task: ToDoTaskTeaser) =>
            task.uid === selectedTaskUid
    );

    let fullText: string;

    if (currentTask) {
        fullText = [
            `<h3>${currentTask.title}</h3>`,
            `${currentTask.description}`
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

// *** Store

/**
 * Add task into list after selected item
 *
 * @param tasks existed list
 * @param selectedTaskUid uid of already selected item
 * @return
 */
export function addEmptyTaskAfterSelected<T extends ToDoTask>(
    tasks: T[],
    selectedTaskUid: string,
    newItem: T
): T[] {
    const selectedItemIndex = _.findIndex(
        tasks,
        (task: ToDoTask) => task.uid === selectedTaskUid
    );

    if (selectedItemIndex === -1) {
        throw new Error('Can\'t find task with set id!');
    }

    tasks.splice(selectedItemIndex + 1, 0, newItem);

    return tasks;
}

export function createNewToDoTaskBlank(title, groupUid: number = null): ToDoTask {
    return {
        description: '',
        groupUid,
        isDone: false,
        title,
        uid: getNewUid()
    } as any;
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

function getNewUid(): number {
    return --newBlankUidCounter;
}

export function markTaskInListAs<T extends ToDoTask>(
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
