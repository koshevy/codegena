import _ from 'lodash';

import {
    MonoTypeOperatorFunction,
    Observable,
    forkJoin,
    of,
    throwError
} from 'rxjs';
import {
    catchError,
    filter,
    map,
    mergeMap,
    scan,
    share,
    takeUntil
} from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';

import { pickResponseBody } from '@codegena/ng-api-service';
import {
    DeleteGroupResponse,
    ToDoGroup,
    UpdateGroupResponse,
    CreateGroupService,
    DeleteGroupService,
    GetGroupsService,
    UpdateGroupService
} from '@codegena/todo-app-scheme';

import {
    Partial,
    ActionType,
    ComponentTruth,
    ComponentContext, ToDoGroupTeaser
} from './lib/context';

import {
    countItemsInGroups,
    createTodoGroupTeaser,
    createTodoGroupTeasers,
    markAllAsDone,
    markGroupAsDone,
    markGroupTeaserAs,
    removeGroupFromList,
    updateGroupsListItem
} from './lib/helpers';

// ***

/**
 * Store-service for {@link TodosGroupComponent}.
 * Create and maintain data flow and reducing.
 *
 * Reducing is based in pure function, excepts data from API.
 * Allows only API-data prviders in DI.
 */
@Injectable()
export class TodosGroupStore {

    constructor(
        protected getGroupsService: GetGroupsService,
        protected createGroupService: CreateGroupService,
        protected updateGroupService: UpdateGroupService,
        protected deleteGroupService: DeleteGroupService
    ) {}

    /**
     * Creates and returns new flow with integrated reduce,
     * described in {@link reduceContext}, started at {@link truth$}.
     */
    getNewContextFlow(
        truth$: Observable<ComponentTruth>
    ): Observable<ComponentContext> {
        return truth$.pipe(
            // Middleware
            mergeMap<Partial<ComponentContext>, Observable<ComponentTruth>>(
                this.middleWare.bind(this, truth$)
            ),
            // Reducer
            scan<Partial<ComponentContext>, ComponentContext>(
                this.reduceContext,
                {} as any
            ),
            // Maps context to expand with calculated options
            map<ComponentContext, ComponentContext>(
                this.contextExtender.bind(this)
            ),
            share()
        );
    }

    // *** Private methods

    /**
     * Concurrency asynchronous middleware.
     * Handles action types, do async actions, and send result to reduce.
     *
     * After middleware, reduce obtains ready data
     * to apply for actual in moment context.
     *
     * @param nextTruth$
     * @param truth
     * @return
     */
    private middleWare(
        nextTruth$: Observable<ComponentTruth>,
        truth: ComponentTruth
    ): Observable<ComponentTruth> {
        switch (truth.$$lastAction) {
            case ActionType.AddNewGroup:

                return this.createGroupService.request(_.omit(
                    truth.createdGroup,
                    'uid'
                )).pipe(
                    // Take until it get canceled
                    this.waitForActionOfGroup(
                        nextTruth$,
                        ActionType.CancelCreation,
                        truth.createdGroup.uid
                    ),
                    pickResponseBody<ToDoGroup>(201, null, true),
                    map<ToDoGroup, ComponentContext>(group => ({
                        ...truth,
                        createdGroup: markGroupTeaserAs(
                            group,
                            'clear'
                        ),
                        createdGroupPrevUid: truth.createdGroup.uid
                    })),
                    // fixme fix error handling
                    catchError(error => of({
                        ...truth,
                        createdGroup: markGroupTeaserAs(
                            truth.createdGroup,
                            'failed'
                        ),
                        createdGroupPrevUid: null
                    }))
                );

            case ActionType.EditGroup:

                return this.updateGroupService.request(
                    truth.editedGroup,
                    {
                        groupId: truth.editedGroup.uid
                    }
                ).pipe(
                    // Take until it get canceled
                    this.waitForActionOfGroup(
                        nextTruth$,
                        ActionType.CancelUpdating,
                        truth.editedGroup.uid
                    ),
                    pickResponseBody<UpdateGroupResponse<200>>(200, null, true),
                    map<ToDoGroup, ComponentContext>(group => ({
                        ...truth,
                        editedGroup: markGroupTeaserAs(group, 'clear')
                    })),
                    catchError(error => {
                        return of({
                            ...truth,
                            editedGroup: markGroupTeaserAs(
                                truth.editedGroup,
                                'failed'
                            )
                        });
                    })
                );

            case ActionType.InitializeWithRouteParams:

                const getGroupsParams = _.pick(
                    truth,
                    [
                        'isComplete',
                        'isCreateGroupModalOpen',
                        'isCurrentGroup',
                    ]
                );

                // Get all groups from API
                return this.getGroupsService.request(null, getGroupsParams).pipe(
                    pickResponseBody<ToDoGroup[]>(200),
                    map<ToDoGroup[], ComponentContext>(todosGroups => ({
                        ...truth,
                        groups: createTodoGroupTeasers(todosGroups),
                        noInternetError: false
                    })),
                    this.catchConnectionLostAtInit(truth)
                );

            case ActionType.MarkAllAsDone:
            case ActionType.MarkAllAsUndone:

                return forkJoin(_.map<ToDoGroupTeaser[], Observable<ToDoGroupTeaser>>(
                    truth.groups,
                    (group: ToDoGroupTeaser) =>
                        this.updateGroupService.request(
                            markGroupAsDone(
                                group,
                                (truth.$$lastAction === ActionType.MarkAllAsDone)
                                    ? 'done'
                                    : 'undone',
                                true
                            ),
                            {
                                groupId: group.uid
                            }
                        ).pipe(
                            // Take until it get canceled
                            this.waitForActionOfGroup(
                                nextTruth$,
                                ActionType.CancelUpdating,
                                group.uid
                            ),
                            pickResponseBody<UpdateGroupResponse<200>>(200, null, true),
                            map<ToDoGroup, ToDoGroupTeaser>(createTodoGroupTeaser),
                            catchError(() => of(group))
                        )
                )).pipe(map(groups =>
                    ({
                        ...truth,
                        groups
                    })
                ));

            case ActionType.MarkGroupAsDone:
            case ActionType.MarkGroupAsUndone:

                return this.updateGroupService.request(
                    markGroupAsDone(
                        truth.editedGroup,
                        (truth.$$lastAction === ActionType.MarkGroupAsDone)
                            ? 'done'
                            : 'undone'
                    ),
                    {
                        groupId: truth.editedGroup.uid
                    }
                ).pipe(
                    // Take until it get canceled
                    this.waitForActionOfGroup(
                        nextTruth$,
                        ActionType.CancelUpdating,
                        truth.editedGroup.uid
                    ),
                    pickResponseBody<UpdateGroupResponse<200>>(200, null, true),
                    map<ToDoGroup, ComponentContext>(group => ({
                        ...truth,
                        editedGroup: markGroupTeaserAs(
                            group,
                            'clear'
                        )
                    })),
                    catchError(error => {
                        return of({
                            ...truth,
                            editedGroup: markGroupTeaserAs(
                                truth.editedGroup,
                                'failed'
                            )
                        });
                    })
                );

            case ActionType.DeleteItem:

                return this.deleteGroupService.request(
                    null,
                    {
                        groupId: truth.removedGroup.uid
                    }
                ).pipe(
                    pickResponseBody<DeleteGroupResponse<202>>(202),
                    map<null, ComponentContext>(() => ({
                        ...truth,
                        removedGroup: truth.removedGroup
                    })),
                    catchError(error => {
                        return of({
                            ...truth,
                            removedGroup: markGroupTeaserAs(
                                truth.removedGroup,
                                'failed'
                            )
                        });
                    })
                );

            default:
                return of(truth);
        }
    }

    private reduceContext(
        context: ComponentContext,
        truth: ComponentTruth
    ): ComponentContext {

        switch (truth.$$lastAction) {

            case ActionType.AddNewGroup:

                return {
                    ...context,
                    ...truth,
                    groups: updateGroupsListItem(
                        context.groups,
                        truth.createdGroup,
                        null,
                        truth.createdGroupPrevUid
                    )
                };

            case ActionType.AddNewGroupOptimistic:

                return {
                    ...context,
                    ...truth,
                    groups: updateGroupsListItem(
                        context.groups,
                        truth.createdGroup,
                        'optimistic'
                    )
                };

            case ActionType.CancelCreation:
                // Cancel was not created
                return {
                    ...context,
                    ...truth,
                    groups: removeGroupFromList(
                        context.groups,
                        truth.removedGroup.uid
                    )
                };

            case ActionType.CancelUpdating:
                // Cancel created, by tried to change
                return {
                    ...context,
                    ...truth,
                    groups: updateGroupsListItem(
                        context.groups,
                        truth.removedGroup,
                        'failed'
                    )
                };

            case ActionType.ChangeGroupPosition:
                // todo describe API for ChangeGroup and use
                break;

            case ActionType.ChangeGroupPositionOptimistic:
                moveItemInArray(
                    truth.groups,
                    truth.positionChanging.from,
                    truth.positionChanging.to
                );

                return {...context, ...truth};

            case ActionType.EditGroup:

                return {
                    ...context,
                    ...truth,
                    groups: updateGroupsListItem(
                        context.groups,
                        truth.editedGroup
                    )
                };

            case ActionType.EditGroupOptimistic:

                return {
                    ...context,
                    ...truth,
                    groups: updateGroupsListItem(
                        context.groups,
                        truth.editedGroup,
                        'optimistic'
                    )
                };

            case ActionType.InitializeWithRouteParams:
            case ActionType.MarkAllAsDone:
            case ActionType.MarkAllAsUndone:

                return {
                    ...context,
                    ...truth
                };

            case ActionType.MarkAllAsDoneOptimistic:
            case ActionType.MarkAllAsUndoneOptimistic:

                return {
                    ...context,
                    ...truth,
                    groups: markAllAsDone(
                        context.groups,
                        (truth.$$lastAction === ActionType.MarkAllAsDoneOptimistic)
                            ? 'done'
                            : 'undone',
                        true
                    )
                };

            case ActionType.MarkGroupAsDone:
            case ActionType.MarkGroupAsUndone:

                return {
                    ...context,
                    ...truth,
                    groups: updateGroupsListItem(
                        context.groups,
                        truth.editedGroup
                    )
                };

            case ActionType.MarkGroupAsDoneOptimistic:
            case ActionType.MarkGroupAsUndoneOptimistic:

                return {
                    ...context,
                    ...truth,
                    groups: updateGroupsListItem(
                        context.groups,
                        truth.editedGroup,
                        (truth.$$lastAction === ActionType.MarkGroupAsDoneOptimistic)
                            ? 'doneOptimistic'
                            : 'undoneOptimistic'
                    )
                };

            case ActionType.DeleteItem:

                return {
                    ...context,
                    ...truth,
                    groups: (truth.removedGroup as ToDoGroupTeaser).failed
                        // deleting was failed
                        ? updateGroupsListItem(context.groups, truth.removedGroup, 'clear')
                        // successfully deleted
                        : removeGroupFromList(context.groups, truth.removedGroup.uid)
                };

            case ActionType.DeleteItemOptimistic:

                return {
                    ...context,
                    ...truth,
                    groups: updateGroupsListItem(
                        context.groups,
                        truth.removedGroup,
                        'removing'
                    )
                };

            default: throw new Error('Unknown action type!');
        }
    }

    /**
     * Common part of context changing thats works
     * every time at thuth changing whatever action performs.
     *
     * @param context
     * Original context
     * @return
     * Expanded context
     */
    private contextExtender(context: ComponentContext): ComponentContext {
        context.summaryGroupCount = (context.groups || []).length;
        context.summaryTaskCount = countItemsInGroups(context.groups);
        context.summaryTaskDoneCount = countItemsInGroups(context.groups, true);
        context.areAllComplete = (context.summaryTaskCount === context.summaryTaskDoneCount);
        context.areAllIncomplete = (context.summaryTaskCount === 0);
        context.isBottomPanelDisabled = _.findIndex(
            context.groups,
            (group: ToDoGroupTeaser) => group.optimistic || group.removing || group.removing
        ) !== -1;

        return context;
    }

    /**
     * fixme localTruth.removedGroup.uid === uid
     *
     * @param {Observable<ComponentTruth>} truth$
     * @param {ActionType} actionType
     * @param {number} uid
     * @return {MonoTypeOperatorFunction<any>}
     */
    private waitForActionOfGroup(
        truth$: Observable<ComponentTruth>,
        actionType: ActionType,
        uid: string
    ): MonoTypeOperatorFunction<any> {
        return takeUntil(
            truth$.pipe(
                // Listens for cancel action
                filter((localTruth) =>
                    (localTruth.$$lastAction === actionType)
                    && (localTruth.removedGroup.uid === uid)
                )
            )
        );
    }

    private catchConnectionLostAtInit(truth: ComponentTruth) {
        return catchError<ComponentTruth, Observable<ComponentTruth>>(
            (error: HttpErrorResponse) => {
                if (error.status === 0) {
                    return of({
                        ...truth,
                        noInternetError: true
                    });
                } else {
                    return throwError(error);
                }
            });
    }
}
