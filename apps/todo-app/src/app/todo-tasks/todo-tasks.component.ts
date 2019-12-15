import _ from 'lodash';

import { asyncScheduler, merge, of, Observable, Subject } from 'rxjs';
import {
    bufferWhen,
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    observeOn,
    scan,
    share,
    startWith,
    takeUntil
} from 'rxjs/operators';
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
    createNewToDoTaskBlank,
    getFullTextOfSelectedTask,
    parseFullTextTask
} from './lib/helpers';

// TaskListComponent types
import {
    TaskListComponent,
    TaskListEventType,
    TaskListEventData
} from './task-list';

// ***

const autoSavePeriod = 2000;

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

    // *** Public events

    constructor(
        private store: TodoTasksStore,
        private cdr: ChangeDetectorRef,
        private matSnackBar: MatSnackBar,
        private ngZone: NgZone
    ) {
        this.destroy$ = new Subject<void>();
        // Merged sources of truth
        this.truth$ = this.getNewTruthFlow();
        // Make context flow
        this.context$ = this.getNewContextFlow();
    }

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

        // Turn on listener triggering `SaveChangedItems`
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
                    $$lastAction: ActionType.EditTaskOptimistic,
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
                    $$lastAction: ActionType.DeleteTaskOptimistic,
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
        // Assert context was intialized correctly
        if (!context) {
            this.matSnackBar.open('Something goes wrong!', 'Reload', {
                panelClass: ['alert', 'alert-danger']
            }).onAction().subscribe(() => {
                // Repeats attempt
                location.reload();
            });

            return;
        }

        switch (context.$$lastAction) {
            case ActionType.AddNewTaskOptimistic:
                this.updateTaskEditor(context);
                this.syncedTaskList = context.tasks
                    ? [...context.tasks]
                    : null;

                this.manualActions$.next({
                    $$lastAction: ActionType.SelectTask,
                    lastSelectedTaskUid: context.lastAddedTask.uid
                });

                break;

            case ActionType.EditTaskOptimistic:
                // it's mean only title wa changed (from list)
                if (context.lastEditingData.description === undefined) {
                    this.updateTaskEditor(context);
                } else {
                    this.syncedTaskList = context.tasks
                        ? [...context.tasks]
                        : null;
                }

                break;

            // Return focus to selected task after moving
            case ActionType.ChangeTaskPositionOptimistic:
            case ActionType.AddNewEmptyTaskAfterOptimistic:
            case ActionType.DeleteTaskOptimistic:
                this.syncedTaskList = context.tasks
                    ? [...context.tasks]
                    : null;

                setTimeout(() => this.setFocusToActiveTask(), 0);

                break;

            // for this case nothing to apply in component
            case ActionType.SaveChangedItems:

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

        // Update view related with this.syncedTaskList
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
        return of({
            $$lastAction: ActionType.InitializeWithRouteParams,
            selectedGroups: []
        }) as Observable<ComponentTruth>;
    }

    protected getNewContextFlow(): Observable<ComponentContext> {
        return this.ngZone.runOutsideAngular(() =>
            this.store.getNewContextFlow(this.truth$).pipe(
                catchError(error => {
                    console.error('Error has occured in action:');
                    console.error(error);

                    return of(null);
                })
            )
        );
    }

    /**
     * Listens actions changing any tasks and
     * buffer them to save all once in a period.
     */
    protected initAutoSaveListener(): void {
        this.context$.pipe(
            observeOn(asyncScheduler),
            map<ComponentContext, ToDoTaskTeaser[] | null>(context => {
                let changedTaskUid: string[];

                // Decide what are UID of a recently changed task
                switch (context.$$lastAction) {
                    case ActionType.AddNewEmptyTaskAfterOptimistic:
                    case ActionType.AddNewTaskOptimistic:
                        changedTaskUid = [context.lastAddedTask.uid];
                        break;

                    case ActionType.EditTaskOptimistic:
                        changedTaskUid = [
                            // concrete UID could be set or supposed to be the `selectedTaskUid`
                            context.lastEditingData.uid
                                || context.selectedTaskUid
                        ];

                        break;

                    case ActionType.MarkTaskAsUnDoneOptimistic:
                    case ActionType.MarkTaskAsDoneOptimistic:
                        changedTaskUid = [context.lastToggledTaskUid];
                        break;

                    case ActionType.ChangeTaskPositionOptimistic:
                        changedTaskUid = context.lastAffectedTaskUIds;

                        break;
                }

                // Find whole changed ToDoTaskTeaser
                if (changedTaskUid) {
                    const foundItems = _(changedTaskUid)
                        .tap(v => console.log('tap 0:', v))
                        .map<ToDoTaskTeaser>((uid: string) =>
                            _.find(
                                context.tasks,
                                task => task.uid === uid
                            )
                        )
                        .tap(v => console.log('tap:', v))
                        .filter(task => (task && task.title.trim() !== ''))
                        .value();

                    return foundItems;
                } else {
                    return null;
                }
            }),
            filter(uid => !!uid),
            bufferWhen(() =>
                this.context$.pipe(debounceTime(autoSavePeriod))
            ),
            filter(bufferedUids => !!bufferedUids.length),
        ).subscribe((bufferedTasks: ToDoTaskTeaser[][]) => {
            // uid of tasks have to be saved
            const flatTask = _(bufferedTasks)
                .reverse()
                .flatten()
                .uniqBy(task => task.uid)
                .value();

            if (!flatTask.length) {
                return;
            }

            this.manualActions$.next({
                $$lastAction: ActionType.SaveChangedItems,
                lastBufferedChangedTasks: flatTask
            });
        });
    }

    // *** Private methods

    private addNewTask({title}: TaskListEventData<TaskListEventType.TaskAdded>): void {
        const lastAddedTask: ToDoTaskTeaser = {
            ...createNewToDoTaskBlank(title),
            failed: false,
            optimistic: true,
            pending: false
        };

        this.manualActions$.next({
            $$lastAction: ActionType.AddNewTaskOptimistic,
            lastAddedTask
        });
    }

    private addNewEmptyTaskAfterSelected(): void {
        const lastAddedTask: ToDoTaskTeaser = {
            ...createNewToDoTaskBlank(''),
            failed: false,
            optimistic: true,
            pending: false
        };

        this.manualActions$.next({
            $$lastAction: ActionType.AddNewEmptyTaskAfterOptimistic,
            lastAddedTask
        });
    }

    private changeSelectedTask(fullText): void {
        this.manualActions$.next({
            $$lastAction: ActionType.EditTaskOptimistic,
            lastEditingData: {
                ...parseFullTextTask(fullText),
                uid: null
            }
        });
    }

    private moveTaskFromTo({from, to}: TaskListEventData<TaskListEventType.TaskMoved>) {
        this.manualActions$.next({
            $$lastAction: ActionType.ChangeTaskPositionOptimistic,
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
            $$lastAction: ActionType.ChangeTaskPositionOptimistic,
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
            ? ActionType.MarkTaskAsDoneOptimistic
            : ActionType.MarkTaskAsUnDoneOptimistic;

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
