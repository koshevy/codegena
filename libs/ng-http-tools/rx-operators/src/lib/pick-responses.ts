import { HasResponses, HasContentType } from '@codegena/definitions/aspects';
import {
    HttpEvent,
    HttpErrorResponse,
    HttpResponse,
} from '@angular/common/http';
import { Observable, Observer, OperatorFunction } from 'rxjs';

type ResponseCode = keyof HasResponses;
type ContentType = keyof HasContentType;

export function pickResponse<
    TSubResponse extends TCommonResponse,
    TCommonResponse
    >(
    status: ResponseCode,
    contentType?: ContentType,
    throwIfOther = true
): OperatorFunction<
    HttpEvent<TCommonResponse> | HttpErrorResponse,
    TSubResponse
> {
    return pickResponses([status], contentType, throwIfOther);
}

export function pickResponses<
    TSubResponse extends TCommonResponse,
    TCommonResponse
>(
    statuses: ResponseCode[],
    contentType?: ContentType,
    throwIfOther = true
): OperatorFunction<
    HttpEvent<TCommonResponse> | HttpErrorResponse,
    TSubResponse
> {
    return (source: Observable<HttpEvent<TSubResponse>  | HttpErrorResponse>) => {
        return new Observable(observer => source.subscribe({
            next(event: HttpEvent<TSubResponse> | HttpErrorResponse): void {
                doNextEvent(
                    event, observer, statuses, contentType, throwIfOther,
                );
            },
            error(error: HttpErrorResponse | unknown): void {
                if (error instanceof HttpErrorResponse) {
                    return this.next(error);
                }

                observer.error(error);
            },
            complete(): void {
                observer.complete();
            },
        }));
    }
}

function doNextEvent<TSubResponse>(
    event: HttpEvent<TSubResponse> | HttpErrorResponse,
    observer: Observer<TSubResponse>,
    statuses: ResponseCode[],
    contentType: ContentType,
    throwIfOther: boolean,
): void {
    let response: HttpResponse<TSubResponse> | HttpErrorResponse;
    let responseBody: TSubResponse;

    if (event instanceof HttpErrorResponse) {
        response = event;
        responseBody = event.error;
    }

    if (event instanceof HttpResponse) {
        response = event;
        responseBody = event.body;
    }

    if (!response) {
        return;
    }

    const receivedContentType = response.headers.get('content-type');
    let errorMessage: string;

    if (!statuses.includes(response.status as ResponseCode)) {
        errorMessage = [
            `Unexpected status code: ${response.status}`,
            `original status: ${response.statusText}`,
        ].join('; ')
    }

    if (!errorMessage && contentType
        && contentType !== receivedContentType) {
        errorMessage = [
            `Unexpected content-type: ${contentType}`,
            `original status: ${response.statusText}`,
        ].join('. ');
    }

    if (errorMessage && throwIfOther) {
        observer.error(new HttpErrorResponse({
            error: responseBody,
            headers: response.headers,
            status: response.status,
            statusText: errorMessage,
            url: response.url,
        }));

        return;
    }

    if (!errorMessage) {
        observer.next(responseBody);
    }
}
