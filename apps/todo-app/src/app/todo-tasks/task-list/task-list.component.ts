import * as _ from 'lodash';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    Output,
    OnInit,
    OnChanges,
    SimpleChange,
    ViewChild
} from '@angular/core';

import { ToDoGroup, ToDoTask } from '@codegena/todo-app-scheme';

import { ToDoTaskTeaser } from '../lib/context';
import { getNonCommentSibling } from './lib/helpers'

import { TaskListEventType, TaskListEventData } from './lib/context';
// fixme move here
import { CdkDragDrop } from '@angular/cdk/drag-drop';

// ***

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'task-list',
  styleUrls: ['./task-list.component.scss'],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit, OnChanges {

    /**
     * Task list has to be displayed. `null` means "not initialized",
     * and should display placeholder.
     */
    @Input() taskList: ToDoTaskTeaser[] | null;

    @Input() selectedTaskUid: string;
    @Input() showMode: 'all' | 'undone' = 'all';
    @Output() eventsOutput: EventEmitter<TaskListEventData>;

    @ViewChild('tasksList', {
        read: false,
        static: false
    }) tasksListElement: ElementRef;

    @ViewChild('newTaskInput', {
        read: false,
        static: false
    }) newTaskInput: ElementRef;

    newTaskTitle: string;

    // Auto updating data
    totalTasksCount: number;
    leftTasksCount: number;

    // *** Public methods

    constructor() {
        this.eventsOutput = new EventEmitter<TaskListEventData>();
    }

    ngOnInit() {
    }

    ngOnChanges({taskList}: {[key: string]: SimpleChange}) {
        if (!taskList || !taskList) {
            return false;
        }

        const tasks = taskList.currentValue as ToDoTaskTeaser[];

        // compute intermediate data changing with task list
        if (tasks) {
            this.totalTasksCount = tasks.length;
            this.leftTasksCount = _.reduce(
                tasks,
                (sum, task) => sum + (task.isDone ? 0 : 1),
                0
            );
        } else {
            // taskList can be `null`
            this.totalTasksCount = 0;
            this.leftTasksCount = 0;
        }

        if (!this.leftTasksCount) {
            this.showMode = 'all';
        }
    }

    isTaskSelected(task: ToDoTaskTeaser): boolean {
        return task.uid === this.selectedTaskUid
            || task.prevTempUid === this.selectedTaskUid;
    }

    /**
     * Method for parent components.
     * Provide facility to set focus to active task.
     */
    setFocusToActiveTask() {
        if (this.tasksListElement) {
            const nativeElement: HTMLElement = this
                .tasksListElement
                .nativeElement;
            const selectedLi = nativeElement
                .querySelector<HTMLElement>('.selected [contentEditable]');

            if (selectedLi) {
                selectedLi.focus();
            }
        } else {
            this.setFocusNewTaskInput();
        }
    }

    setFocusNewTaskInput() {
        (this.newTaskInput.nativeElement as HTMLElement).focus();
    }

    trackByTasks(index, item: ToDoTask): string {
        return item.uid;
    }

    // *** Events

    onTaskToggle({target}, {isDone, uid}: ToDoTaskTeaser): void | boolean {
        // Ignore, when clicked on button or text
        if ((target as HTMLElement).nodeName !== 'LI') {
            return;
        }

        this.eventsOutput.emit({
            isDone: !isDone,
            type: TaskListEventType.TaskToggled,
            uid
        });

        return false;
    }

    onTaskDelete({uid}: ToDoTaskTeaser): void {
        this.eventsOutput.emit({
            type: TaskListEventType.TaskDeleted,
            uid
        });
    }

    onNewTaskNameEnter(event): void | boolean {
        if (!this.newTaskTitle) {
            return false;
        }

        const title = this.newTaskTitle.trim();

        if (title) {
            this.newTaskTitle = '';
            this.eventsOutput.emit({
                title,
                type: TaskListEventType.TaskAdded
            });
        }

        return false;
    }

    onTaskListFocusIn(event: FocusEvent): void {
        this.setFocusToActiveTask();
    }

    onTaskFocusIn(event: FocusEvent, {uid}: ToDoTaskTeaser): void {
        // Ignoring echo of previous selected item
        if (uid === this.selectedTaskUid) {
            return;
        }

        this.eventsOutput.emit({
            type: TaskListEventType.TaskGotFocus,
            uid
        });
    }

    onTaskKeydown(event: KeyboardEvent, task: ToDoTaskTeaser): void | boolean {
        switch (event.key) {
            case 'Enter':
                // Toggle isDone-state of task
                if (event.shiftKey) {
                    // fixme fix this behavior
                    this.eventsOutput.emit({
                        title: '',
                        type: TaskListEventType.TaskAddedAfterSelected
                    });

                    return false;
                } else if (event.ctrlKey || event.metaKey) {
                    this.eventsOutput.emit({
                        isDone: !task.isDone,
                        type: TaskListEventType.TaskToggled,
                        uid: task.uid
                    });

                    return false;
                }

            // Does the same with Tab Key

            case 'Tab':
                if (event.shiftKey) {
                    this.setFocusNewTaskInput();
                } else {
                    // Delegate focus for decided by parent sibling
                    this.eventsOutput.emit({
                        type: TaskListEventType.FocusDelegated,
                        uid: task.uid
                    });
                }

                return false;

            case 'Backspace':
            case 'Delete':
                if (event.altKey || event.ctrlKey || event.metaKey) {
                    this.eventsOutput.emit({
                        type: TaskListEventType.TaskDeleted,
                        uid: task.uid
                    });

                    return false;
                }

                break;

            case 'ArrowUp':
            case 'ArrowDown':

                // Top side reached
                if (event.key === 'ArrowUp' && task === this.taskList[0]) {
                    break;
                }

                // Bottom side reached
                if (event.key === 'ArrowDown'
                    && task === this.taskList[this.taskList.length - 1]) {
                    break;
                }

                if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
                    // Hint: type of event should be set explicitly; so TypeScript
                    // can understand distinguish typing of parameter.
                    if (event.key === 'ArrowUp') {
                        this.eventsOutput.emit({
                            type: TaskListEventType.TaskMovedUp,
                            uid: task.uid
                        });
                    } else {
                        this.eventsOutput.emit({
                            type: TaskListEventType.TaskMovedDown,
                            uid: task.uid
                        });
                    }

                    return false;

                } else {
                    // Navigate between adjasent tasks in list
                    // fixme there no need to use DOM-navigating. use state

                    const target = event.currentTarget as HTMLElement;

                    if (target.nodeName !== 'LI') {
                        break;
                    }

                    const sibling = getNonCommentSibling(
                        target,
                        (event.key === 'ArrowUp') ? 'prev' : 'next'
                    );

                    if (!sibling || sibling.nodeName !== 'LI') {
                        break;
                    }

                    (sibling as HTMLElement)
                        .querySelector<HTMLElement>('[contentEditable]')
                        .focus();
                }

                break;
        }
    }

    onTaskInput(event: KeyboardEvent, {uid}: ToDoTaskTeaser): void | boolean {
        const targetLi = event.target as HTMLElement;

        this.eventsOutput.emit({
            title: targetLi.textContent,
            type: TaskListEventType.TaskChanged,
            uid,
        });
    }

    onTaskDropped(event: CdkDragDrop<ToDoGroup[]>) {
        this.eventsOutput.emit({
            from: event.previousIndex,
            to: event.currentIndex,
            type: TaskListEventType.TaskMoved
        });
    }
}
