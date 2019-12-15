import * as _ from 'lodash';

import {
    MonoTypeOperatorFunction,
    Observable,
    forkJoin,
    of,
    throwError,
    queueScheduler
} from 'rxjs';
import {
    catchError,
    filter,
    map,
    mergeMap,
    observeOn,
    scan,
    share,
    shareReplay,
    switchMap,
    takeUntil
} from "rxjs/operators";

import { Injectable } from '@angular/core';

import { pickResponseBody } from '@codegena/ng-api-service';
import {
    ToDoGroup,
    ToDoTask,
    GetGroupsResponse,
    GetGroupItemsResponse,
    GetGroupsService,
    GetGroupItemsService,
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
            map<ComponentContext, ComponentContext>(afterReduce),
            // For cases when gets default state before subscribes
            shareReplay(1)
        );
    }

    // *** Protected methods

    protected middleWare(
        nextTruth$: Observable<ComponentTruth>,
        truth: ComponentTruth
    ): Observable<ComponentTruth> {
        switch (truth.$$lastAction) {
            case ActionType.InitializeWithRouteParams:

                return this.getGroupsService.request(null, {
                    isComplete: false,
                    withItems: false
                }).pipe(
                    pickResponseBody<GetGroupsResponse<200>>(200, null, true),
                    switchMap<ToDoGroup[], Observable<ComponentTruth>>(
                        groups => this.applySelectedGroupsToTruth(truth, groups)
                    )
                );

            case ActionType.SaveChangedItems:
                return this.saveChangedTasks(truth);

            default:
                return of({...truth});
        }
    }

    // *** Middleware chains

    /**
     *
     * @param truth
     * @param groups
     * @return
     * Return prepared truth for reducing to {@link ComponentContext}
     * in {@link reduce}: will get items of selected groups and
     * current selected group cursor.
     */
    private applySelectedGroupsToTruth(
        truth: ComponentTruth,
        groups: ToDoGroup[]
    ): Observable<ComponentTruth> {
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

        return forkJoin(...selectedGroups.map(
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
        )).pipe(
            map<ToDoTask[][], ToDoTask[]>(_.flatten),
            map<ToDoTask[], ComponentTruth>(tasks => ({
                ...truth,
                groups,
                selectedGroupUids: selectedGroups,
                selectedTaskUid: _.get(tasks, '0.uid', null),
                tasks: _.sortBy(tasks, 'position'),
            }))
        );
    }

    /**
     * Gets buffered tasks, saves them and updates truth.
     *
     * @param itemsUids
     * @return
     */
    private saveChangedTasks(truth: ComponentTruth): Observable<ComponentTruth> {
        return this.updateFewItemsService.request(
            truth.lastBufferedChangedTasks || [],
            {}
        ).pipe(
            pickResponseBody<UpdateFewItemsResponse<200>>(
                200,
                null,
                true
            ),
            map(updatedTasks => {
                return {
                    ...truth,
                    lastBufferedChangedTasks: updatedTasks
                };
            })
        );
    }
}
