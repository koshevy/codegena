import _ from 'lodash';

import {
    Observable,
    OperatorFunction,
    Subscriber
} from 'rxjs';

import { tap } from 'rxjs/operators';
import { HttpEvent, HttpHeaders, HttpResponse } from '@angular/common/http';

/**
 * Success code you can use for catching success response.
 * If you need error code, use error catching.
 */
type CodeRange = | 100 | 101 | 102
                 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226
                 | 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;

/**
 * Error code you can use for catching error response.
 */
type ErrorCodeRange = | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408
                      | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417
                      | 418 | 419 | 420 | 421 | 422 | 423 | 424 | 426 | 428
                      | 429 | 431 | 449 | 451 | 499
                      | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508
                      | 509 | 510 | 511 | 520 | 521 | 522 | 523 | 524 | 525 | 526;

/**
 * Function for handling response.
 */
type ResponseBodyHandler<Body> = (
    responseBody: Body,
    responseHeaders?: HttpHeaders
) => void;

/**
 * Error throws when handler gets unexpected response code
 * or content type in {@link HttpResponse}.
 */
export class UnexpectedResponse extends Error {
    constructor(
        public code: number,
        public message: string,
        public response: HttpResponse<any>,
        public conditions: {
            codes: CodeRange[],
            contentTypes: string[]
        }
    ) {
        super();
    }
}

/**
 * Handle response with specified `code` and `contentType`,
 * using response body, and continue with no result changes.
 *
 * @param code
 * @param contentType
 * @param handler
 */
export function tapResponse<R, S = R>(
    code: CodeRange | CodeRange[],
    contentType: string | string[],
    handler: ResponseBodyHandler<S>,
): OperatorFunction<HttpResponse<R>, HttpResponse<R> | HttpEvent<any>>;

/**
 * Handle response with specified `code`,
 * using response body, and continue with no result changes.
 *
 * @param code
 * @param contentType
 * @param handler
 */
export function tapResponse<R, S = R>(
    code: CodeRange | CodeRange[],
    handler: ResponseBodyHandler<S>,
): OperatorFunction<HttpResponse<R>, HttpResponse<R> | HttpEvent<any>>;

/**
 * Handle response using response body, and continue with no result changes.
 *
 * @param code
 * @param contentType
 * @param handler
 */
export function tapResponse<R, S = R>(
    handler: ResponseBodyHandler<S>
): OperatorFunction<HttpResponse<R>, HttpResponse<R> | HttpEvent<any>>;

export function tapResponse<R, S = R>(...args)
    : OperatorFunction<HttpResponse<R>, HttpResponse<R> | HttpEvent<any>> {

    const [handler] = args.slice(-1);
    let code: CodeRange | CodeRange [],
        contentType: string | string[];

    if (args.length >= 2) {
        code = args[0];
        if (!_.isArray(code)) { code = [code] as CodeRange[]; }
    }

    if (args.length === 3) {
        contentType = args[1];
        if (!_.isArray(contentType)) { contentType = [contentType] as string[]; }
    }

    return tap((nextResponse: HttpResponse<R> | any) => {
        // filter off other events
        if (nextResponse instanceof HttpResponse === false) {
            return;
        }

        // filter off other statuses
        if (code && !_.includes(code as CodeRange[], nextResponse.status)) {
            return;
        }

        // filter off other types
        if (contentType && !_.includes(
            contentType as string[],
            nextResponse.headers.get('content-type')
        )) {
            return;
        }

        handler(nextResponse.body as S, nextResponse.headers);
    });

}

/**
 * Filter responses by code and content type.
 * Other events and responses with other code/type will be ignored.
 *
 * Maps value from {@link HttpResponse} to `HttpResponse.body`.
 *
 * @param code
 * @param contentTypes
 * @param throwIfOther
 * Throw error at getting {@link HttpResponse} with code/type not matching
 * to conditions.
 */
export function pickResponseBody<R, S = R>(
    codes?: CodeRange | CodeRange[],
    contentTypes?: string | string[],
    throwIfOther: boolean = false
): OperatorFunction<HttpResponse<R>, S> {
    if (codes && !_.isArray(codes)) {
        codes = [codes];
    }

    if (contentTypes && !_.isArray(contentTypes)) {
        contentTypes = [contentTypes];
    }

    /**
     * Will throw error if `throwIfOther`
     */
    const assertOther = (
        response: HttpResponse<R>,
        observer: Subscriber<S>
    ) => {
        if (throwIfOther) {
            observer.error(new UnexpectedResponse(
                Infinity,
                'Result is successful, but unexpected',
                response,
                {
                    codes: codes as CodeRange[],
                    contentTypes: contentTypes as string[]
                }
            ));
        }
    };

    // Switching to
    return (source: Observable<HttpResponse<R>>) =>
        new Observable<S>(observer => source.subscribe({
            next(response: HttpResponse<R>) {
                try {
                    // filter off other events
                    if (response instanceof HttpResponse === false) {
                        assertOther(response, observer);

                        return;
                    }

                    // filter off other statuses
                    if (codes && !_.includes(codes as CodeRange[], response.status)) {
                        assertOther(response, observer);

                        return;
                    }

                    // filter off other types
                    if (contentTypes &&
                        !_.includes(
                            contentTypes as string[],
                            response.headers.get('content-type')
                        )
                    ) {
                        assertOther(response, observer);

                        return;
                    }

                    observer.next(response.body as any as S);
                } catch (err) {
                    observer.error(err);
                }
            },
            error(err) {
                observer.error(err);
            },
            complete() {
                observer.complete();
            }
        })
    );
}

// TODO catchErrorResponse<R, S>(codes: ErrorCodeRange[]?, contentTypes?)
// TODO tapHeaderResponse<R, S>(codes?, contentTypes?)
// TODO tapProgress
// TODO tapSent
