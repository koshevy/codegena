import * as _ from 'lodash';
import { Partial } from './lib/partial';

import {
    assertUniqueTitle,
    createGroupFromBlank,
    createTaskFromBlank
} from './helpers';

import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';

import {
    GetGroupItemsParameters,
    GetGroupsParameters,
    GetGroupsResponse,
    ToDoGroup,
    ToDoGroupBlank,
    ToDoTask,
    ToDoTaskBlank
} from '@codegena/todo-app-scheme/src/lib/typings';

import { defaultGroups } from './defaults';

/**
 * Mock service imitates storage for {@link ToDoGroup} and {@link ToDoTask},
 * as if it was a facade of DB-storage. Keeps temporary session data in memory
 * without authentification.
 */
@Injectable()
export class TodoStorageService {

    /**
     * This service stores all data in session.
     * Session should be set before using via {@link setSession}.
     */
    public session;

    constructor() {
        // ...
    }

    /**
     * Set session injected to controller action.
     * Session should be set before first using of service:
     *
     * @example
     * ```
     * return this.appService
     *     .setSession(session)
     *     .patchGroup(params.groupId, body);
     * ```
     *
     * @param session
     * @return
     */
    setSession(session): TodoStorageService {
        this.session = session;
        return this;
    }

    /**
     * @param filters
     * @return Array of found groups
     */
    getGroups(filters: GetGroupsParameters = {}): ToDoGroup[] {
        let result = defaultGroups;

        if (this.session) {
            if (this.session.groups) {
                result = this.session.groups;
            } else {
                this.session.groups = result;
            }
        }

        return _(result)
            .filter((group: ToDoGroup) =>
                ('boolean' === typeof filters.isComplete)
                    ? (group.isComplete === filters.isComplete)
                    : true
            )
            .map((group: ToDoGroup) =>
                filters.withItems === false ? { ...group, items: [] } : group
            )
            .value();
    }

    /**
     * @param groupUid
     * @return
     * @throws NotFoundException
     * @return Found group
     */
    getGroupByUid(groupUid: string): ToDoGroup {
        const groups = this.getGroups();
        const foundGroup = _.find(
            groups,
            (group: ToDoGroup) => group.uid === groupUid
        );

        if (!foundGroup) {
            throw new NotFoundException(`Group with uid=${groupUid} not found`);
        }

        return foundGroup;
    }

    /**
     * @param groupBlank
     * @return Created group with assigned UID and meta-data
     */
    createGroup(groupBlank: ToDoGroupBlank): ToDoGroup {
        groupBlank.title = (groupBlank.title || '').trim();

        const groups = this.getGroups();

        assertUniqueTitle(groups, groupBlank.title);

        const newGroup = createGroupFromBlank(groupBlank);
        this.session.groups = [...groups, newGroup];

        return newGroup;
    }

    /**
     * @param groupUid
     * @param groupBlank
     * @return Updated group data
     * @throws NotFoundException
     */
    rewriteGroup(groupUid: string, groupBlank: ToDoGroupBlank): ToDoGroup {
        const alreadyExistsGroup = this.getGroupByUid(groupUid);

        assertUniqueTitle(this.getGroups(), groupBlank.title, groupUid);

        /**
         * Omitted options of `ToDoGroupBlank`:
         * if `items` not set in blank, ignoring in result group too.
         */
        const omitOptions = groupBlank.items
            ? ['dateCreated', 'uid']
            : ['dateCreated', 'items', 'uid'];

        const group: ToDoGroup = createGroupFromBlank(groupBlank);
        const patch: Partial<ToDoGroup> = _.omit(group, omitOptions);

        return _.assign(alreadyExistsGroup, patch);
    }

    /**
     * @param groupUid
     * @param patch
     * @return Updated group data
     * @throws NotFoundException
     */
    patchGroup(groupUid: string, patch: Partial<ToDoGroupBlank>): ToDoGroup {
        const alreadyExistsGroup = this.getGroupByUid(groupUid);

        if (patch.title) {
            assertUniqueTitle(this.getGroups(), patch.title, groupUid);
        }

        return _.assign(
            alreadyExistsGroup,
            _.omit(patch, ['uid', 'dateCreated', 'items'])
        );
    }

    /**
     * @param groupUid
     * @throws NotFoundException
     */
    deleteGroup(groupUid: string): void {
        const foundIndex = _.findIndex(
            this.getGroups(),
            (group: ToDoGroup) => group.uid === groupUid
        );

        if (foundIndex === -1) {
            throw new NotFoundException(`Group with uid=${groupUid} not found`);
        }

        const groups = this.getGroups();
        groups.splice(foundIndex, 1);
        this.session.groups = groups;
    }

    /**
     * @param groupId
     * @param isComplete
     * @return Filtered tasks of group
     * @throws NotFoundException
     */
    getTasksOfGroup(groupUid: string, isComplete?: boolean): ToDoTask[] {

        return _(this.getGroupByUid(groupUid).items)
            .filter(
                (task: ToDoTask) =>
                    ('boolean' === typeof isComplete)
                        ? (task.isDone === isComplete)
                        : true
            )
            .sortBy(['position'])
            .value();
    }

    getAllTasksOrdered(): ToDoTask[] {
        return _(this.getGroups())
            .map<ToDoTask[]>((group: ToDoGroup) => group.items)
            .flatten()
            .orderBy(['position'], ['asc'])
            .value();
    }

    /**
     * @param groupUid
     * @param taskBlank
     * @return Created task with assigned uid and meta-data
     * @throws NotFoundException
     */
    createTaskOfGroup(groupUid: string, taskBlank: ToDoTaskBlank): ToDoTask {
        const group = this.getGroupByUid(groupUid);

        if (taskBlank.position) {
            const thresold = this.getNewPosition(true);
            if (taskBlank.position >= thresold) {
                throw new Error([
                    `Wrong position of task (${taskBlank.position})!`,
                    `Position should't be greater than ${(thresold || 1)-1}`,
                    `or should't be set.`
                ].join(' '));
            }

            this.shiftTasksPositions(taskBlank.position);
        }

        const newTask = createTaskFromBlank(
            taskBlank,
            taskBlank.position || this.getNewPosition(),
            groupUid
        );

        group.items = [...group.items as ToDoTask[], newTask];

        return newTask;
    }

    /**
     * @param groupUid
     * @param taskUid
     * @param taskBlank Partial task data
     * @return Updated task
     * @throws NotFoundException
     */
    patchTask(groupUid: string, taskUid: string, taskBlank: Partial<ToDoTask>): ToDoTask {
        const task = this.getTask(groupUid, taskUid);
        const updatedData = createTaskFromBlank(
            {...task, ...taskBlank},
            taskBlank.position || this.getNewPosition(),
            groupUid
        );

        return _.assign(
            task,
            _.omit(updatedData, [
                'dateCreated',
                'uid',
            ])
        )
    }

    // *** Private

    /**
     * @param {string} groupUid
     * @param {string} taskUid
     * @throws NotFoundException
     */
    private getTask(groupUid: string, taskUid: string): ToDoTask {
        const taskToFindIn = groupUid
            ? this.getGroupByUid(groupUid).items
            : _(this.getGroups())
                .map<ToDoTask[]>((group: ToDoGroup) => group.items)
                .flatten()
                .value();

        const foundTask = _.find(
            taskToFindIn,
            (task: ToDoTask) => task.uid === taskUid
        );

        if (!foundTask) {
            throw new NotFoundException(
                `Task with uid=${taskUid} not found in group ${groupUid}`
            );
        }

        return foundTask;
    }

    protected getNewPosition(dryRun: boolean = false): number {
        if (!this.session.autoIncrementPosition) {
            const maxPosition = _(this.getGroups())
                .map<ToDoTask[]>((group: ToDoGroup) => group.items)
                .flatten()
                .map<number>((task: ToDoTask) => task.position)
                .max();

            this.session.autoIncrementPosition = maxPosition;
        }

        return dryRun
            ? this.session.autoIncrementPosition + 1
            : ++this.session.autoIncrementPosition;
    }

    protected shiftTasksPositions(fromPosition: number): void {
        const tasks = this.getAllTasksOrdered();
        const fromIndex = _.findIndex(tasks, (task: ToDoTask) =>
            task.position === fromPosition
        );

        if (fromIndex !== -1) {
            for (let i = fromIndex; i < tasks.length; i++) {
                tasks[i].position++;
            }
        }
    }
}
