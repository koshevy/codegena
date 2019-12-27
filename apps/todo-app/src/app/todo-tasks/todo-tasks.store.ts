import * as _ from 'lodash';

import {
    Observable,
    forkJoin,
    of,
    queueScheduler
} from 'rxjs';
import {
    filter,
    map,
    mergeMap,
    observeOn,
    retryWhen,
    scan,
    share,
    shareReplay,
    switchMap,
    tap,
    takeUntil
} from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { pickResponseBody } from '@codegena/ng-api-service';
import {
    CreateGroupItemResponse,
    CreateGroupItemService,
    GetGroupsResponse,
    GetGroupItemsResponse,
    GetGroupsService,
    GetGroupItemsService,
    ToDoGroup,
    ToDoTask,
    UpdateFewItemsService,
    UpdateFewItemsResponse,
    UpdateGroupItemService
} from '@codegena/todo-app-scheme';

import {
    Partial,
    ActionType,
    ComponentCalculatedData,
    ComponentTruth,
    ComponentContext,
    PositionMove,
    PositionMoveByStep,
    ToDoTaskTeaser
} from './lib/context';

import {
    afterReduce,
    getDefaultState,
    reduce
} from './lib/reduce';

import {
    downgradeTeaserToTaskBlank,
    downgradeTeasersToTasks
} from './lib/helpers'

/**
 * Store-service for {@link TodosGroupComponent}.
 * Create and maintain data flow and reducing.
 *
 * Reducing is based in pure function, excepts data from API.
 * Allows only API-data prviders in DI.
 */
@Injectable()
export class TodoTasksStore {

    constructor(
        protected createGroupItemService: CreateGroupItemService,
        protected getGroupsService: GetGroupsService,
        protected getGroupItemsService: GetGroupItemsService,
        protected updateFewItemsService: UpdateFewItemsService
    ) {}

    /**
     * Creates and returns new flow with integrated reduce,
     * described in {@link reduceContext}, started at {@link truth$}.
     */
    getNewContextFlow(
        truth$: Observable<ComponentTruth>
    ): Observable<ComponentContext> {
        return truth$.pipe(
            observeOn(queueScheduler),
            // Middleware
            mergeMap<
                Partial<ComponentContext>,
                Observable<ComponentTruth>
            >(
                this.middleWare.bind(this, truth$)
            ),
            // Reducer
            scan<Partial<ComponentContext>, ComponentContext>(
                reduce,
                getDefaultState()
            ),
            // Maps context to expand with calculated options
            map<ComponentContext, ComponentContext>(afterReduce)
        );
    }

    // *** Protected methods

    protected middleWare(
        nextTruth$: Observable<ComponentTruth>,
        truth: ComponentTruth
    ): Observable<ComponentTruth> {
        switch (truth.$$lastAction) {
            case ActionType.InitializeWithRouteParams:
                return this.initSelectedGroupData(truth);

            case ActionType.SaveChangedTasks:
                return this.saveChangedTasks(truth);

            default:
                return of({...truth});
        }
    }

    // *** Middleware chains

    /**
     * Primary loading all groups list (with no tasks data within)
     * and additional loading tasks of groups marked as "selected"
     * in a truth.
     *
     * @param {ComponentTruth} truth
     * @return {Observable<ComponentTruth>}
     */
    protected initSelectedGroupData(truth: ComponentTruth): Observable<ComponentTruth> {
        return this.getGroupsService.request(null, {
            isComplete: null,
            withItems: false
        }).pipe(
            pickResponseBody<GetGroupsResponse<200>>(200, null, true),
            switchMap<ToDoGroup[], Observable<ComponentTruth>>(
                groups => this.loadItemsOfSelectedGroups({
                    ...truth,
                    groups
                })
            )
        );
    }

    /**
     * Load tasks of those of given group that
     * presented in `truth.selectedGroupUids`.
     *
     * @param truth
     * @return
     * Return prepared truth for reducing to {@link ComponentContext}
     * in {@link reduce}: will get items of selected groups and
     * current selected group cursor.
     */
    protected loadItemsOfSelectedGroups(
        truth: ComponentTruth
    ): Observable<ComponentTruth> {
        const groups = truth.groups;
        const selectedGroups: string[] = (truth.selectedGroupUids || []).length
            ? _.intersection(groups.map(group => group.uid), truth.selectedGroupUids)
            : groups.map(group => group.uid);

        if (!selectedGroups.length) {
            return of({
                ...truth,
                groups: [],
                tasks: []
            });
        }

        const requests = _.map<string, Observable<GetGroupItemsResponse<200>>>(
            selectedGroups,
            groupId => this.getGroupItemsService.request(
                null,
                { groupId }
            ).pipe(
                pickResponseBody<GetGroupItemsResponse<200>>(
                    200,
                    null,
                    true
                )
            )
        ) ;

        /**
         * Load tasks of all selected groups
         */
        return forkJoin(requests).pipe(
            map<ToDoTask[][], ToDoTask[]>(_.flatten),
            map<ToDoTask[], ComponentTruth>(tasks => ({
                ...truth,
                groups,
                selectedGroupUids: selectedGroups,
                selectedTaskUid: _.get(tasks, '0.uid', null),
                tasks: _.orderBy(tasks, ['position']),
            }))
        );
    }

    /**
     * Gets buffered tasks, saves them and updates truth.
     *
     * @param itemsUids
     * @return
     */
    protected saveChangedTasks(truth: ComponentTruth): Observable<ComponentTruth> {
        if (!truth.lastBufferedChangedTasks || !truth.lastBufferedChangedTasks.length) {
            return of(truth);
        }

        /**
         * Just created items should be saved by other way —
         * creating API
         */
        const justCreatedItems = _.remove(
            truth.lastBufferedChangedTasks,
            task => task.isJustCreated
        );

        const requests: Array<Observable<ToDoTask[]>> = [];

        // add request to update
        if (truth.lastBufferedChangedTasks.length) {
            requests.push(
                this.updateEditedTasks(truth.lastBufferedChangedTasks)
            );
        }

        // add request to create
        if (justCreatedItems.length) {
            requests.push(
                this.createTasks(justCreatedItems)
            );
        }

        return forkJoin(requests).pipe(
            map<ToDoTask[][], ComponentTruth>(result =>
                ({
                    ...truth,
                    lastBufferedChangedTasks: _.flatten(result)
                })
            ),
        );
    }

    // *** Helpers

    private assureBuffersUidsActual(
        truth: ComponentTruth,
        context: ComponentContext
    ): ComponentTruth {

        _.each(context.lastBufferedChangedTasks, bufferedTask => {
            const foundSameWithNewUid = _.find(
                context.tasks,
                task => task.prevTempUid === bufferedTask.uid
            );
        });

        return truth;
    }

    private updateEditedTasks(editedTasks: ToDoTaskTeaser[]): Observable<ToDoTask[]> {
        return this.updateFewItemsService.request(
            downgradeTeasersToTasks(editedTasks),
            {}
        ).pipe(
            pickResponseBody<UpdateFewItemsResponse<200>>(
                200,
                null,
                true
            )
        );
    }

    private createTasks(createdTasks: ToDoTaskTeaser[]): Observable<ToDoTask[]> {
        const createRequests = _.map<ToDoTaskTeaser, Observable<ToDoTask>>(
            createdTasks,
            task => {
                const prevTempUid = task.uid;

                return this.createGroupItemService.request(
                    downgradeTeaserToTaskBlank(task),
                    {
                        groupId: task.groupUid
                    }
                ).pipe(
                    pickResponseBody<CreateGroupItemResponse<201>>(
                        201,
                        null,
                        true
                    ),
                    map(newTask => ({...newTask, prevTempUid}))
                )
            }
        );

        return forkJoin(createRequests);
    }
}
