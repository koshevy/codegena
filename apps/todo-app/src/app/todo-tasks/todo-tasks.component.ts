import _ from 'lodash';

import { asyncScheduler, merge, of, Observable, Subject } from 'rxjs';
import {
    bufferWhen,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    observeOn,
    retryWhen,
    share,
    shareReplay,
    startWith,
    switchMap,
    takeUntil,
    tap
} from "rxjs/operators";
import {
    Component,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ElementRef,
    OnDestroy,
    OnInit,
    NgZone,
    ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// It's just why plugin can be skipped by tree-shaker
import * as frolaListPlugin from 'froala-editor/js/plugins/lists.min';

import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
    ActionType,
    ComponentContext,
    ComponentTruth,
    PositionMove,
    PositionMoveByStep,
    ToDoTaskTeaser
} from './lib/context';

import { TodoTasksStore } from './todo-tasks.store';

import {
    createNewTaskTeaser,
    getFullTextOfSelectedTask,
    parseFullTextTask,
    syncTaskListValidStatus
} from './lib/helpers';

// TaskListComponent types
import {
    TaskListComponent,
    TaskListEventType,
    TaskListEventData
} from './task-list';

// ***

const autoSavePeriod = 800;

// ***

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        TodoTasksStore
    ],
    selector: 'lib-todo-tasks',
    styleUrls: ['./todo-tasks.component.scss'],
    templateUrl: './todo-tasks.component.html'
})
export class TodoTasksComponent implements OnDestroy, OnInit {

    // *** Configs

    frolaOptions = {
        attribution: false,
        events: {
            // Proxy non-catching events from Froala
            keydown: ({originalEvent}) => {
                this.onEditorKeydownFroala(originalEvent);
            }
        },
        immediateAngularModelUpdate: true,
        inlineStyles: {
            'Big Red': 'font-size: 20px; color: red;',
            'Small Blue': 'font-size: 14px; color: blue;'
        },
        placeholderText: 'Enter task title',
        pluginsEnabled: [
            'inlineStyle',
            'lists'
        ],
        toolbarButtons: [
            'bold',
            'italic',
            'underline',
            'strikeThrough',
            'fontSize',
            'inlineStyle',
            'formatOLSimple',
            'formatUL',
            'clearFormatting',
        ],
    };

    // It's just why plugin can be skipped by tree-shaker
    frolaPlugins = [
        frolaListPlugin
    ];

    // *** View children

    @ViewChild('taskEditor', {
        read: false,
        static: false
    }) takEditorElement: ElementRef;

    @ViewChild(TaskListComponent, {
        read: false,
        static: false
    }) taskListComponent: TaskListComponent;

    // *** Component state

    /**
     * Flow that collect all changes of values that could influence
     * to component state. Once one of that changes, this flow prepare
     * it in a common 'Truth', and emits this complete 'Truth'.
     */
    truth$: Observable<ComponentTruth>;

    /**
     * Full context flow of component. Do changes of view
     * every emission.
     */
    context$: Observable<ComponentContext>;

    /**
     * Emitting to this channel completes {@link truth$} and {@link context$}.
     */
    destroy$: Subject<void>;

    /**
     * Part of 'truth': channel with manual-triggered actions and theirs data
     */
    manualActions$: Subject<ComponentTruth> = new Subject();

    // *** Form data

    taskEditorControl: FormControl = new FormControl('');

    /**
     * Synchronized task list of tasks.
     * This property is needed because tasks list uses `isContentEditable`,
     * and direct synchronization of view with context would reset editing cursor.
     */
    syncedTaskList: ToDoTaskTeaser[];

    // *** Public methods

    constructor(
        private store: TodoTasksStore,
        private cdr: ChangeDetectorRef,
        private matSnackBar: MatSnackBar,
        private ngZone: NgZone,
        private route: ActivatedRoute
    ) {
        this.destroy$ = new Subject<void>();
        // Merged sources of truth
        this.truth$ = this.getNewTruthFlow();
        // Make context flow
        this.context$ = this.getNewContextFlow();
    }

    // *** Hooks

    ngOnInit(): void {
        // Bind context applier to context changes
        this.context$.subscribe(this.applyContext.bind(this));

        // Handle editor changes
        this.ngZone.runOutsideAngular(() =>
            this.taskEditorControl.valueChanges.pipe(
                distinctUntilChanged(),
            )
        ).subscribe(
            this.changeSelectedTask.bind(this)
        );

        // Turn on listener triggering `SaveChangedTasks`
        // when any task changed
        this.initAutoSaveListener();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    // *** Events

    onEditorKeydown(event: KeyboardEvent): void | boolean {
        switch (event.key) {
            case 'Tab':
                if (event.shiftKey) {
                    this.setFocusToActiveTask();

                    return false;
                }
        }
    }

    /**
     * Catch Froala events, non-catching from template binding.
     *
     * @param {KeyboardEvent} event
     * @return {void | boolean}
     */
    onEditorKeydownFroala(event: KeyboardEvent): void | boolean {
        switch (event.key) {
            case 'Escape':
                this.setFocusToActiveTask();

                return false;
        }
    }

    /**
     * Listening custom events from {@link TaskListComponent}.
     *
     * @param event
     * Event payload dat sent from
     */
    onTaskListEvent(event: TaskListEventData): void {
        switch (event.type) {
            case TaskListEventType.FocusDelegated:
                this.setFocusToEditor();
                break;
            case TaskListEventType.TaskAdded:
                this.addNewTask(event);
                break;
            case TaskListEventType.TaskAddedAfterSelected:
                this.addNewEmptyTaskAfterSelected();
                break;
            case TaskListEventType.TaskChanged:
                this.manualActions$.next({
                    $$lastAction: ActionType.EditTask,
                    lastEditingData: {
                        title: event.title,
                        uid: event.uid
                    }
                });
                break;
            case TaskListEventType.TaskMoved:
                this.moveTaskFromTo(event);
                break;
            case TaskListEventType.TaskMovedUp:
            case TaskListEventType.TaskMovedDown:
                this.moveTaskUpDown(event);
                break;
            case TaskListEventType.TaskDeleted:
                this.manualActions$.next({
                    $$lastAction: ActionType.DeleteTask,
                    lastDeletedTaskUid: event.uid
                });
                break;
            case TaskListEventType.TaskGotFocus:
                this.manualActions$.next({
                    $$lastAction: ActionType.SelectTask,
                    lastSelectedTaskUid: event.uid
                });
                break;
            case TaskListEventType.TaskToggled:
                this.toggleTaskIsDone(event);
                break;
        }
    }

    // *** Protected methods

    /**
     * This method is intended to be a bridge between abstract state of
     * component and component mechanics such closely connected with
     * environment of component: dependencies and view.
     *
     * @param context
     */
    protected applyContext(context: ComponentContext): void {
        if (!context) {
            return;
        }

        switch (context.$$lastAction) {
            case ActionType.AddNewTask:
                this.updateTaskEditor(context);
                this.syncedTaskList = context.tasks
                    ? [...context.tasks]
                    : null;

                this.manualActions$.next({
                    $$lastAction: ActionType.SelectTask,
                    lastSelectedTaskUid: context.lastAddedTask.uid
                });

                break;

            case ActionType.EditTask:
                /**
                 * {@link this.syncedTaskList} has to be saved after editing
                 * only when editing was caused in a TaskEditor. If editing
                 * happened in TaskList, updating list should drive to cursor reset.
                 */
                if (context.lastEditingData.description === undefined) { // not in editor
                    this.updateTaskEditor(context);
                    syncTaskListValidStatus(
                        context.tasks,
                        this.syncedTaskList
                    );
                } else {
                    this.syncedTaskList = context.tasks
                        ? [...context.tasks]
                        : null;
                }

                break;

            // Return focus to selected task after moving
            case ActionType.ChangeTaskPosition:
            case ActionType.AddNewEmptyTaskAfter:
            case ActionType.DeleteTask:
                this.syncedTaskList = context.tasks
                    ? [...context.tasks]
                    : null;

                setTimeout(() => this.setFocusToActiveTask(), 0);

                break;

            // for this case nothing to apply in component
            case ActionType.SaveChangedTasks:

                this.matSnackBar.open('Changes saved', null, {
                    duration: 1000,
                    panelClass: ['alert', 'alert-success']
                });

                break;

            default:
                this.updateTaskEditor(context);
                this.syncedTaskList = context.tasks
                    ? [...context.tasks]
                    : null;
        }

        // Update View related with this.syncedTaskList
        this.cdr.detectChanges();
    }

    protected getNewTruthFlow(): Observable<ComponentTruth> {
        return this.ngZone.runOutsideAngular(() =>
            merge(
                // From route
                this.getNewRouteParamsTruthFlow(),
                // Actions, dispatched manually
                this.manualActions$
            ).pipe(
                // Init action
                startWith({
                    $$lastAction: ActionType.InitializeWithDefaultState
                }),
                share(),
                takeUntil(this.destroy$)
            )
        );
    }

    protected getNewRouteParamsTruthFlow(): Observable<ComponentTruth> {
        return this.route.queryParams.pipe(
            map<{selectedGroup?: string}, ComponentTruth>(queryParams => ({
                $$lastAction: ActionType.InitializeWithRouteParams,
                selectedGroupUids: queryParams.selectedGroup
                    ? [queryParams.selectedGroup]
                    : []
            }))
        );
    }

    protected getNewContextFlow(): Observable<ComponentContext> {
        return this.ngZone.runOutsideAngular(() =>
            this.store.getNewContextFlow(this.truth$).pipe(
                retryWhen(source =>
                    source.pipe(tap(error => {
                        this.matSnackBar.open(
                            `
                            Something goes wrong (see console).
                            Context was refreshed.`,
                            'Got it', {
                            panelClass: ['alert', 'alert-danger']
                        });

                        console.error('Error occured in action');
                        console.error(error);
                    }))
                ),
                shareReplay()
            )
        );
    }

    /**
     * Listens actions changing any tasks, buffer them
     * and emit action {@link ActionType.SaveChangedTasks}
     * once in a period.
     */
    protected initAutoSaveListener(): void {
        // buffering UID's of changed tasks and emitting ActionType.SaveChangedTasks
        this.context$.pipe(
            observeOn(asyncScheduler),
            filter(context => !!context),
            switchMap<ComponentContext, Observable<ToDoTaskTeaser>>(context => {
                let changedTaskUid: string[] = [];

                // Decide what are UID of a recently changed task
                switch (context.$$lastAction) {
                    case ActionType.AddNewEmptyTaskAfter:
                    case ActionType.AddNewTask:
                        changedTaskUid = [context.lastAddedTask.uid];
                        break;

                    case ActionType.EditTask:
                        changedTaskUid = [
                            // concrete UID could be set or supposed to be the `selectedTaskUid`
                            context.lastEditingData.uid
                                || context.selectedTaskUid
                        ];

                        break;

                    case ActionType.MarkTaskAsUnDone:
                    case ActionType.MarkTaskAsDone:
                        changedTaskUid = [context.lastToggledTaskUid];
                        break;

                    case ActionType.ChangeTaskPosition:
                        changedTaskUid = context.lastAffectedTaskUIds;

                        break;
                }

                return of(
                    // Map task uids to ToDoTaskTeaser objects from context.tasks
                    ..._.map<string, ToDoTaskTeaser>(changedTaskUid, uid =>
                        _.find(
                            context.tasks,
                            task => task.uid === uid
                        )
                    )
                );
            }),
            filter(task => !!task && !task.isInvalid),
            bufferWhen(() =>
                this.context$.pipe(
                    debounceTime(autoSavePeriod),
                    filter(task => !task.hasInvalidTasks)
                )
            ),
            filter(bufferedUids => !!bufferedUids.length),
        ).subscribe((bufferedTasks: ToDoTaskTeaser[]) => {
            // unique tasks have to be saved
            const uniqueTasks = _(bufferedTasks)
                .reverse()
                .uniqBy(task => task.uid)
                .value() as ToDoTaskTeaser[];

            this.manualActions$.next({
                $$lastAction: ActionType.SaveChangedTasks,
                lastBufferedChangedTasks: uniqueTasks
            });
        });
    }

    // *** Private methods (utilites)

    private addNewTask({title}: TaskListEventData<TaskListEventType.TaskAdded>): void {
        this.manualActions$.next({
            $$lastAction: ActionType.AddNewTask,
            lastAddedTask: createNewTaskTeaser(title)
        });
    }

    private addNewEmptyTaskAfterSelected(): void {
        this.manualActions$.next({
            $$lastAction: ActionType.AddNewEmptyTaskAfter,
            lastAddedTask: createNewTaskTeaser('')
        });
    }

    private changeSelectedTask(fullText): void {
        this.manualActions$.next({
            $$lastAction: ActionType.EditTask,
            lastEditingData: {
                ...parseFullTextTask(fullText),
                uid: null
            }
        });
    }

    private moveTaskFromTo({from, to}: TaskListEventData<TaskListEventType.TaskMoved>) {
        this.manualActions$.next({
            $$lastAction: ActionType.ChangeTaskPosition,
            lastTaskPositionChanging: { from, to }
        });
    }

    private moveTaskUpDown(event: TaskListEventData<
        | TaskListEventType.TaskMovedUp
        | TaskListEventType.TaskMovedDown
    >) {
        const direction = (event.type === TaskListEventType.TaskMovedUp)
            ? PositionMoveByStep.Up
            : PositionMoveByStep.Down;

        // Move item position
        this.manualActions$.next({
            $$lastAction: ActionType.ChangeTaskPosition,
            lastTaskPositionChanging: direction
        });
    }

    private setFocusToEditor() {
        if (this.takEditorElement) {
            const { nativeElement } = this.takEditorElement;
            const focusedArea = (nativeElement as HTMLElement)
                .querySelector<HTMLElement>('[contentEditable]');

            if (focusedArea) {
                focusedArea.focus();
            }
        }
    }

    private setFocusToActiveTask() {
        if (this.taskListComponent) {
            this.taskListComponent.setFocusToActiveTask();
        }
    }

    private toggleTaskIsDone(event: TaskListEventData<TaskListEventType.TaskToggled>): void {
        const actionType = event.isDone
            ? ActionType.MarkTaskAsDone
            : ActionType.MarkTaskAsUnDone;

        this.manualActions$.next({
            $$lastAction: actionType,
            lastToggledTaskUid: event.uid
        });
    }

    private updateTaskEditor(context: ComponentContext): void {
        const selectedTaskFullText = getFullTextOfSelectedTask(
            context.tasks,
            context.selectedTaskUid
        );

        // Change view, but not to emit to subscriber
        this.taskEditorControl.setValue(selectedTaskFullText, {
            emitEvent: false,
            emitViewToModelChange: true
        });
    }
}
