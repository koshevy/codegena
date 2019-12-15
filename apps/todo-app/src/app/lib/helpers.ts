/**
 * Helpers for TodoApp:
 * utilities in pure functions.
 */

// *** imports
import _ from 'lodash';
import { ToDoTaskBlank } from '@codegena/todo-app-scheme';
import { FormControl } from '@angular/forms';

/**
 * Regex that retrieves `[x]` from strings such as:
 * ```
 * [x] Close reviews of Andromeda and Big Dipper
 * ```
 */
const taskTextReg = /^\s{0,128}\[\s{0,12}(x|X)\s{0,8}\]\s{0,128}((\S+).+)/;

/**
 * Converts text like this:
 * ```
 * [x] Close reviews of Andromeda and Big Dipper
 * Do planing of sprint Cassiopeia
 * ```
 * to array of {@link ToDoTaskBlank}.
 */
export function ToDoTasksFromText(tasksText: string): ToDoTaskBlank[] {
    if (!tasksText) {
        return [];
    }

    const items = _.map<string, ToDoTaskBlank>(
        (tasksText || '').split('\n'),
        (srcLine) => {
            const item = {
                description: null,
                isDone: false,
                title: srcLine
            };

            const matches = taskTextReg.exec(item.title);

            if (matches) {
                item.title = matches[2];
                item.isDone = true;
            }

            return item;
        }
    );

    return items;
}

export function textFromToDoTasks(items: ToDoTaskBlank[]): string {
    return _.map<ToDoTaskBlank[], string>(
        items || [],
        (item: ToDoTaskBlank) => `${item.isDone ? '[x] ' : ''}${item.title}`
    ).join('\n');
}

/**
 * Save persistent data, associated with specified component
 */
export function savePersistentData(
    component: object,
    key: string,
    data: any
): void {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    try {
        key = `${component.constructor.name}__${key}`;
        window.localStorage.setItem(key, JSON.stringify(data));
        console.log('Save', key, data);
    } catch (err) {
        console.error('Can\'t save data to the local storage', data);
    }
}

/**
 * Load persistent data, associated with specified component
 */
export function loadPersistentData(
    component: object,
    key: string
): any {

    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    try {
        key = `${component.constructor.name}__${key}`;

        return JSON.parse(window.localStorage.getItem(key));
    } catch (err) {
        console.error('Can\'t load data from the local storage');
    }
}

/**
 * Clear persistent data, associated with specified component
 */
export function clearPersistentData(
    component: object,
    key: string
) {
    savePersistentData(component, key, null);
}

/**
 * Factory for Reactive Form validator, such checks
 * that value is unique among collection items
 */
export function createUniqValidator(
    collection: Array<{[key: string]: string | any}>,
    field: string
) {
    const preparedArray = _.map(
        collection || [],
        (collectionItem: {[key: string]: string}) =>
            (collectionItem[field] || '').trim().toLowerCase()
    );

    return (control: FormControl) => {
        const controlValue = (control.value || '').trim().toLowerCase();

        if (!control.value) { return null; }

        const foundIndex = _.findIndex(
            preparedArray,
            value => value === controlValue
        );

        return (foundIndex === -1) ? null : {
            unique: `Already exists group "${control.value}"`
        };
    };
}
