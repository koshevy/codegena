import { Subject, Subscriber } from 'rxjs';

import {
    HttpErrorResponse,
    HttpEvent,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';

/**
 * Interface of "Sender" that do request and
 * works with attempts.
 */
export interface RequestSender<R = any, B = any> {

    /**
     * Interface of sender. Assumes, you might
     * do repeated attempts of request.
     *
     * @param request
     * @param subscriber
     * @param statusChanges
     * @param lastError
     * @param remainAttemptsNumber
     */
    requestAttempt(
        request: HttpRequest<B>,
        subscriber: Subscriber<HttpResponse<R>>,
        statusChanges: Subject<HttpEvent<R>> | boolean,
        lastError?: HttpErrorResponse,
        remainAttemptsNumber?: number
    ): void;
}
