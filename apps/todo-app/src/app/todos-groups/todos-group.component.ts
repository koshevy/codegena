import _ from 'lodash';
import {
    combineLatest,
    merge,
    timer,
    Observable,
    Subject
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    finalize,
    map,
    share,
    scan,
    timeout,
    takeUntil,
    tap
} from 'rxjs/operators';

import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute, ResolveData } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Overlay } from '@angular/cdk/overlay';

import { ToDoGroup } from '@codegena/todo-app-scheme';
import { createUniqValidator } from '../lib/helpers';

import { EditGroupComponent, EditGroupConfig } from './edit-group/edit-group.component';
import {
    Partial,
    ActionType,
    ToDoGroupTeaser,
    ComponentTruth,
    ComponentContext
} from './lib/context';
import { TodosGroupStore } from './todos-group.store';
import { ConfirmationService } from '../confirmation/confirmation.service';

// ***

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TodosGroupStore],
    selector: 'lib-todos-group',
    styleUrls: ['./todos-group.component.scss'],
    templateUrl: './todos-group.component.html',
})
export class TodosGroupComponent implements OnInit {

    /**
     * Flow that collect all changes of values that could influence
     * to component state. Once one of that changes, this flow prepare
     * it in a common "Truth", and emits this complete "Truth".
     */
    truth$: Observable<ComponentTruth>;

    /**
     * Full context flow of component. Do changes of view
     * every emission.
     */
    context$: Observable<ComponentContext>;

    /**
     * Part of "truth": channel with manual-triggered actions and theirs data
     */
    manualActions$: Subject<Partial<ComponentTruth>> = new Subject();

    /**
     * Last emitted value in {@link context$},
     * saved by subscriber in {@link listenEffects}.
     */
    syncContext: ComponentContext;

    private tempIdCounter = -1;

    constructor(
        protected activatedRoute: ActivatedRoute,
        protected matBottomSheet: MatBottomSheet,
        protected matSnackBar: MatSnackBar,
        protected overlay: Overlay,
        protected confirmationService: ConfirmationService,
        protected store: TodosGroupStore,
    ) {
        /**
         * Merge sources of truth
         */
        this.truth$ = merge(
            // From route
            this.getTruthFromRouteParams(),
            // Actions, dispatched manually
            this.manualActions$
        ).pipe(
            // And transform to complete truth
            scan<Partial<ComponentTruth>, ComponentTruth>(
                (acc, cur) => ({ ...acc, ...cur })
            ),
            share()
        );
    }

    ngOnInit() {
        this.context$ = this.store.getNewContextFlow(this.truth$);
        // bind context changes to effect listening
        this.context$.subscribe(this.applyContext.bind(this));
    }

    getTruthFromRouteParams(): Observable<ComponentTruth> {
        return combineLatest([
            this.activatedRoute.data,
            this.activatedRoute.queryParams
        ]).pipe(
            map<[any, any], any>(([data, queryParams]) =>
                ({...data, ...queryParams})
            ),
            distinctUntilChanged(_.isEqual),
            map<any, ComponentTruth>(({isComplete, isCurrentGroup, isCreateGroupModalOpen}) => {
                return {
                    $$lastAction: ActionType.InitializeWithRouteParams,
                    isComplete: isComplete || null,
                    isCreateGroupModalOpen,
                    isCurrentGroup: isCurrentGroup || null,
                };
            })
        );
    }

    applyContext(context: ComponentContext): void {

        // Before syncing context
        const shouldCreateModalBeShown = context.isCreateGroupModalOpen
            && !_.get(this.syncContext, 'isCreateGroupModalOpen');

        // Syncing context
        this.syncContext = context;

        switch (context.$$lastAction) {
            case ActionType.AddNewGroupOptimistic:
                this.matSnackBar.open('Group are saving...', null, {
                    duration: 1000,
                    panelClass: ['alert', 'alert-info']
                });
                break;

            case ActionType.AddNewGroup:
                const teaserOfCreatedGroup = _.find(
                    context.groups,
                    ({uid}) => uid === context.createdGroup.uid
                );

                if (!teaserOfCreatedGroup) {
                    throw new Error('Application logic error!');
                }

                if (teaserOfCreatedGroup.failed) {
                    this.matSnackBar.open('Creation failed!', 'Remove', {
                        duration: 3000,
                        panelClass: ['alert', 'alert-danger']
                    }).onAction().subscribe(() => {
                        // Repeats attempt
                        this.removeIncompleteGroup(context.createdGroup);
                    });
                } else {
                    this.matSnackBar.open('Changing successful saved!', null, {
                        duration: 1500,
                        panelClass: ['alert', 'alert-success']
                    });
                }

                break;

            default:

                // Show modal if needed
                if (shouldCreateModalBeShown) { this.createGroup(); }
        }
    }

    // *** Events

    createGroup() {

        // Additional validator for Group Creation Form:
        // check for unique of group
        const popupConfig: EditGroupConfig = {
            customValidators: {
                title: [createUniqValidator(
                    this.syncContext.groups,
                    'title'
                )]
            }
        };

        // Open creation dialog
        const subscribtion = this.openEditGroupPopup(popupConfig)
            .subscribe((group: ToDoGroup) => {
                // Optimistic adding of item (before sending to server)
                this.manualActions$.next({
                    $$lastAction: ActionType.AddNewGroupOptimistic,
                    createdGroup: group
                });
                // Sending to server
                this.manualActions$.next({
                    $$lastAction: ActionType.AddNewGroup,
                    createdGroup: group
                });

                subscribtion.unsubscribe();
            });
    }

    editGroup(group: ToDoGroup) {
        // Additional validator for Group Creation Form:
        // check for unique of group
        const popupConfig: EditGroupConfig = {
            customValidators: {},
            initialToDoGroupBlank: group
        };

        // Open creation dialog
        const subscription = this.openEditGroupPopup(popupConfig)
            .pipe(
                takeUntil(
                    // shown while `isCreateGroupModalOpen`
                    this.truth$.pipe(filter(
                        context => !!context.isCreateGroupModalOpen
                    ))
                )
            )
            .subscribe((todoGroup: ToDoGroup) => {
                this.manualActions$.next({
                    $$lastAction: ActionType.EditGroupOptimistic,
                    editedGroup: todoGroup,
                });
                this.manualActions$.next({
                    $$lastAction: ActionType.EditGroup,
                    editedGroup: todoGroup,
                });

                subscription.unsubscribe();
            });
    }

    groupDropped(event: CdkDragDrop<ToDoGroupTeaser[]>) {
        this.manualActions$.next({
            $$lastAction: ActionType.ChangeGroupPositionOptimistic,
            groups: this.syncContext.groups,
            positionChanging: {
                from: event.previousIndex,
                to: event.currentIndex
            }
        });
    }

    markAllAsDone() {
        if (this.syncContext.areAllComplete) {
            return;
        }

        this.manualActions$.next({
            $$lastAction: ActionType.MarkAllAsDoneOptimistic,
            groups: this.syncContext.groups,
        });
        this.manualActions$.next({
            $$lastAction: ActionType.MarkAllAsDone,
            groups: this.syncContext.groups,
        });
    }

    markAllAsUndone() {
        if (this.syncContext.areAllIncomplete) {
            return;
        }

        this.manualActions$.next({
            $$lastAction: ActionType.MarkAllAsUndoneOptimistic,
            groups: this.syncContext.groups,
        });
        this.manualActions$.next({
            $$lastAction: ActionType.MarkAllAsUndone,
            groups: this.syncContext.groups,
        });
    }

    markGroupAsDone(group: ToDoGroup) {
        this.manualActions$.next({
            $$lastAction: ActionType.MarkGroupAsDoneOptimistic,
            editedGroup: group,
        });
        this.manualActions$.next({
            $$lastAction: ActionType.MarkGroupAsDone,
            editedGroup: group,
        });
    }

    markGroupAsUndone(group: ToDoGroup) {
        this.manualActions$.next({
            $$lastAction: ActionType.MarkGroupAsUndoneOptimistic,
            editedGroup: group,
        });
        this.manualActions$.next({
            $$lastAction: ActionType.MarkGroupAsUndone,
            editedGroup: group,
        });
    }

    removeGroup(group: ToDoGroup) {
        this.confirmationService.confirm(
            [
                {
                    text: 'Remove group and all tasks. This action would not be canceled!',
                    title: 'Delete',
                    value: true
                },
                {
                    text: 'Keep group and tasks',
                    title: 'Cancel',
                    value: false,
                }
            ]
        )   .pipe(
                filter(result => !!result),
                // Hide dialog after 10 seconds of idle if no answer
                timeout(10000),
            )
            .subscribe((result: boolean) => {
                this.manualActions$.next({
                    $$lastAction: ActionType.DeleteItemOptimistic,
                    removedGroup: group
                });
                this.manualActions$.next({
                    $$lastAction: ActionType.DeleteItem,
                    removedGroup: group
                });
            });
    }

    removeIncompleteGroup(group: ToDoGroup) {
        // fixme uid not number anymore
        // const actionType = group.uid < 0
        //     ? ActionType.CancelCreation
        //     : ActionType.CancelUpdating;
        const actionType = ActionType.CancelCreation;

        this.manualActions$.next({
            $$lastAction: actionType,
            removedGroup: group
        });
    }

    tryAgainUpdate(group: ToDoGroup) {
        this.manualActions$.next({
            $$lastAction: ActionType.AddNewGroupOptimistic,
            createdGroup: group,
        });
        this.manualActions$.next({
            $$lastAction: ActionType.AddNewGroup,
            createdGroup: group,
        });
    }

    // *** Private methods

    private openEditGroupPopup(popupConfig: EditGroupConfig)
        : Observable<ToDoGroup> {

        const bottomRef = this.matBottomSheet.open<
            EditGroupComponent,
            EditGroupConfig,
            ToDoGroup
        >(EditGroupComponent, {
            data: popupConfig,
            scrollStrategy: this.overlay.scrollStrategies.reposition()
        });

        return bottomRef
            .afterDismissed() // Waiting for result
            .pipe(
                finalize(() => bottomRef.dismiss()),
                filter(v => !!v),
                // takeUntil(),
                map((newGroup: ToDoGroup) => ({
                    ...newGroup,
                        // Adds temporary ID if not set
                    uid: newGroup.uid || this.getTempId()
                }))
            );
    }

    /**
     * Returns new temporary ID for optimistic added items.
     */
    private getTempId(): string {
        // fixme use nanoid
        return String(this.tempIdCounter--);
    }
}
