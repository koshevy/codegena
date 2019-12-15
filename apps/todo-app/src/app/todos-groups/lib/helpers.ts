import * as _ from 'lodash';

import { ToDoGroup, ToDoTask } from '@codegena/todo-app-scheme';
import { ToDoGroupTeaser } from './context';

/**
 * Create {@link ToDoGroupTeaser} from {@link ToDoGroup}
 * (adds counters data).
 *
 * @param {ToDoGroup} srcGroup
 * @return {ToDoGroupTeaser}
 */
export function createTodoGroupTeaser(srcGroup: ToDoGroup): ToDoGroupTeaser {
    return {
        ...srcGroup,
        countOfDone: _.filter(
            srcGroup.items || [],
        ({isDone}) => isDone
        ).length,
        totalCount: (srcGroup.items || []).length
    };
}

/**
 * Make an array of {@link ToDoGroupTeaser} from array of {@link ToDoGroup}
 *
 * @param {ToDoGroup[]} srcGroups
 * @return {ToDoGroupTeaser[]}
 */
export function createTodoGroupTeasers(srcGroups: ToDoGroup[]): ToDoGroupTeaser[] {
    return _.map(srcGroups, createTodoGroupTeaser);
}

/**
 * Mark all items in a group as done all undone.
 * @param group
 * @param type
 * @param clearTeaser
 * Should it clear al properties from {@link ToDoGroupTeaser},
 * not specified for {@link ToDoGroup}
 *
 * @return
 */
export function markGroupAsDone(
    group: ToDoGroup | ToDoGroupTeaser,
    type: 'done' | 'undone' = 'done',
    clearTeaser: boolean = true
): ToDoGroup | ToDoGroupTeaser {
    group.items = _.map(
        group.items,
        (item: ToDoTask) => {
            item.isDone = (type === 'done');

            return item;
        }
    );

    return clearTeaser
        ? _.omit(group, ['countOfDone', 'totalCount']) as ToDoGroup
        : group as ToDoGroupTeaser;
}

/**
 * Calculates total count of items in groups
 *
 * @param groups
 * @param isDone
 * - true — calculate only done
 * - false — calculate only undone
 * - null — calculate all
 */
export function countItemsInGroups(
    groups: ToDoGroupTeaser[],
    isDone: boolean | null = null
): number {
    return _.reduce(groups || [], (sum, group: ToDoGroupTeaser) => {
        switch (isDone) {
            case true:  return sum + group.countOfDone;
            case false: return sum + group.totalCount - group.countOfDone;
            default:    return sum + group.totalCount;
        }
    }, 0);
}

/**
 * Unified function for adding/changing group in list of groups.
 *
 * @param groupsList
 * Array of {@link ToDoGroupTeaser}, that has to be changed
 * @param groupData
 * {@link ToDoGroupTeaser}-object: will be added to `groupsList`, if there is
 * no objects with `uid` of it's object (or `uid` set in `groupUid` parameter).
 * And change already added items.
 * @param markAs
 * Mark as 'optimistic', 'removing' or 'failed' (only one). If set 'clear', removes
 * other marks. If `null` — clear all marks.
 * @param groupUid
 * "Temporary" uid for optimistic items. Will be overwrite by uid from `groupData`.
 * @return
 * Return copy of array with changed or created item
 */
export function updateGroupsListItem(
    groupsList: ToDoGroupTeaser[],
    groupData: ToDoGroup,
    markAs: | 'optimistic'
            | 'removing'
            | 'failed'
            | 'clear'
            | 'doneOptimistic'
            | 'undoneOptimistic'
            | null = null,
    groupUid?: string
): ToDoGroupTeaser[] {

    const groupTeaser = markGroupTeaserAs(groupData, markAs);

    groupUid = groupUid ? groupUid : groupData.uid;

    // It may be an already added group or new
    const alreadyAddedIndex = _.findIndex(
        groupsList,
        item => item.uid === groupUid
    );

    // add or update
    if (alreadyAddedIndex !== -1) {
        groupsList[alreadyAddedIndex] = groupTeaser;
    } else {
        groupsList.push(groupTeaser);
    }

    // return copy of an array
    return [...groupsList];
}

export function markGroupTeaserAs(
    group: ToDoGroup | ToDoGroupTeaser,
    markAs: | 'optimistic' | 'removing' | 'failed'
            | 'clear' | 'doneOptimistic' | 'undoneOptimistic'
            | null = null,
): ToDoGroupTeaser {
    let groupTeaser = createTodoGroupTeaser(group);

    switch (markAs) {
        case 'clear':
            groupTeaser.failed = false;
            groupTeaser.optimistic = false;
            groupTeaser.removing = false;
            break;
        case 'doneOptimistic':
            groupTeaser = markGroupAsDone(
                groupTeaser,
                'done',
                false
            ) as ToDoGroupTeaser;

            groupTeaser.failed = false;
            groupTeaser.optimistic = true;
            groupTeaser.removing = false;
            break;
        case 'failed':
            groupTeaser.failed = true;
            groupTeaser.optimistic = false;
            groupTeaser.removing = false;
            break;
        case 'optimistic':
            groupTeaser.optimistic = true;
            groupTeaser.failed = false;
            groupTeaser.removing = false;
            break;
        case 'removing':
            groupTeaser.optimistic = false;
            groupTeaser.failed = false;
            groupTeaser.removing = true;
            break;
        case 'undoneOptimistic':
            groupTeaser = markGroupAsDone(
                groupTeaser,
                'undone',
                false
            ) as ToDoGroupTeaser;

            groupTeaser.failed = false;
            groupTeaser.optimistic = true;
            groupTeaser.removing = false;
            break;
        case null: break;
        default: throw new Error(`Unknown marking type "${markAs}" for updated item!`);
    }

    return groupTeaser;
}

export function markAllAsDone(
    groups: ToDoGroupTeaser[],
    type: 'done' | 'undone' = 'done',
    optimistic: boolean = false
): ToDoGroupTeaser[] {
    return _.map(groups, (group: ToDoGroupTeaser) =>
        _.assign(
            createTodoGroupTeaser(markGroupAsDone(group, type)),
            {
                failed: false,
                optimistic,
                removing: false
            }
        )
    );
}

export function removeGroupFromList(
    groupsList: ToDoGroupTeaser[],
    uid: string
): ToDoGroupTeaser[] {
    return _.filter(
        groupsList,
        (item: ToDoGroupTeaser) => item.uid !== uid
    );
}
