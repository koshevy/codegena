import * as _ from 'lodash';
import nanoid from 'nanoid';
import {
    ToDoGroup,
    ToDoGroupBlank,
    ToDoTask,
    ToDoTaskBlank,
} from '@codegena/todo-app-contract';
import { BadRequestException } from "@nestjs/common";

const generateUid = nanoid;
export function getNowISO(): string {
    const date = new Date();
    return date.toISOString();
}

/**
 * Function gives blank of group and returns complete record
 * with `dateChanged`, `dateCreated` and `uid`.
 *
 * @param groupBlank
 * @return
 */
export function createGroupFromBlank(groupBlank: ToDoGroupBlank): ToDoGroup {
    const nowISO = getNowISO();
    const groupUid = generateUid();
    const items = _.map(
        (groupBlank.items || []),
        (blankTask: ToDoTaskBlank, index) => {
            return createTaskFromBlank(
                blankTask,
                index,
                groupUid,
            );
        },
    );

    return updateIsCompleteStatus({
        ...groupBlank,
        dateChanged: nowISO,
        dateCreated: nowISO,
        items,
        uid: groupUid,
    });
}

/**
 * Function gives blank of task and returns complete record
 * with `dateChanged`, `dateCreated` and `uid`.
 *
 * @param blank
 * @param position
 * @param groupUid
 * @return
 */
export function createTaskFromBlank(
    blank: ToDoTaskBlank,
    position: number | null = null,
    groupUid?: string,
): ToDoTask {
    const nowISO = getNowISO();
    const newTask: ToDoTask = {
        ...blank,
        dateChanged: nowISO,
        dateCreated: nowISO,
        uid: generateUid(),
        position: position ? position : 0 ,
    };

    if (Number.isInteger(position) && (position >= 0)) {
        newTask.position = position;
    }

    if (groupUid) {
        newTask.groupUid = groupUid;
    }

    return newTask;
}

export function assertUniqueTitle(
    items: Array<ToDoGroup | ToDoTask>,
    title: string,
    excludeUid?: string,
): void {
    const alreadyExists = _.find(
        items,
        (item: ToDoGroup | ToDoTask) =>
            item.title === title
                && (!excludeUid || (item.uid !== excludeUid)),
    );

    if (alreadyExists) {
        throw new BadRequestException([
            'Title of group/task should be unique!',
            `There are alreay exists error with id=${alreadyExists.uid}`,
        ].join('\n'));
    }
}

/**
 * Recalculate `isComplete` property of {@link ToDoGroup}-object.
 * Mutates object.
 *
 * @param group
 */
export function updateIsCompleteStatus(group: ToDoGroup): ToDoGroup {
    group.isComplete = _.reduce<ToDoTask[], boolean>(
        group.items,
        (result, task: ToDoTask) =>
            !task.isDone
                ? false
                : (result === null) ? true : result,
        null
    );

    return group;
}
