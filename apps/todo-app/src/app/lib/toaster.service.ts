import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

export interface ToastMessageButton<T> {
    title: string;
    result: T;
}

export interface ToastMessage<T> {
    type: 'default' | 'warning' | 'danger';
    title: string;
    text: string;
    buttons?: Array<ToastMessageButton<T>>;
}

export interface ToastCloseEvent<T> {
    result: T | null;
    toast: ToastMessage<T>;
}

@Injectable()
export class ToasterService {

    toasts$: BehaviorSubject<Array<ToastMessage<any>>> = new BehaviorSubject([]);
    protected closings$: Subject<ToastCloseEvent<any>> = new Subject();

    constructor() {}

    /**
     * Show toast and make cold observable you can subscribe for.
     * Toast wil be revoked when you remove subscribe.
     *
     * @param toast
     * @return
     */
    show<T = any>(toast: ToastMessage<T>): Observable<T> {
        const toasts = this.toasts$.value;

        toasts.push(toast);
        this.toasts$.next(toasts);

        return this.closings$
            .pipe(
                filter((event: ToastCloseEvent<T>) =>
                    event.toast === toast
                ),
                map<ToastCloseEvent<T>, T>(
                    (event: ToastCloseEvent<T>) => event.result
                ),
                finalize(() => this.removeToast(toast))
            );
    }

    close<T>(toast: ToastMessage<T>, result: T) {
        this.removeToast(toast);
        this.closings$.next({
            result,
            toast
        });
    }

    private removeToast(toast: ToastMessage<any>) {
        const toasts = this.toasts$.value;
        this.toasts$.next(toasts.filter(_toast => _toast !== toast));
    }
}
