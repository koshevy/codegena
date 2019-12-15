import { ConnectableObservable, Observable, Subject, of, timer } from 'rxjs';
import { publish, takeUntil } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import {
    ApiErrorEventData,
    ApiErrorHandler,
    ApiErrorEventType,
    ValidationError,
    UrlWhitelistDefinitions,
    API_ERROR_HANDLER,
    SERVERS_INFO,
} from '@codegena/ng-api-service';

import { ToasterService } from './toaster.service';

@Injectable()
export class ApiErrorHandlerService implements ApiErrorHandler {

    constructor(public toaster: ToasterService) {}

    onHttpError(errorData: ApiErrorEventData): void {

        switch (errorData.type) {
            case 500:

                break;

            case 502:

                break;
            // 404 response will be replaced by success answers
            case 404:

                break;

            case ApiErrorEventType.UnknownError:
                // Show toast with warning "No internet"
                const subscription = this.toaster.show<number>({
                    buttons: [
                        {
                            result: 1,
                            title: 'Try again',
                        },
                        {
                            result: 0,
                            title: 'Abort',
                        }
                    ],
                    text: [
                        'It seems, internet connection lost.',
                        'Please, make sure your connection is working and try again.',
                    ].join(' '),
                    title: 'No internet',
                    type: 'default',
                }).subscribe(result => {
                    if (!result) {
                        errorData.subscriber.error(errorData.originalEvent);
                    } else {
                        errorData.sender.requestAttempt(
                            errorData.request,
                            errorData.subscriber,
                            errorData.statusChanges,
                            errorData.originalEvent,
                            Infinity // Infinity count of attempts
                        );
                    }
                });

                // Hide toast on complete
                errorData.subscriber.add(() => {
                    if (!subscription.closed) {
                        subscription.unsubscribe();
                    }
                });

                break;

            default:
                throw new Error('Unexpected error code!');
        }
    }

    onValidationError(errorData: ValidationError): boolean | void {
        (this.toaster.show<number>({
            text: errorData.message,
            title: 'No internet',
            type: 'default',
        }).pipe(
            takeUntil(timer(3000)),
            publish<null>()
        ) as ConnectableObservable<null>).connect();

        console.error(errorData);
    }
}
