import {
    Subject,
    Subscriber,
    BehaviorSubject
} from 'rxjs';

import {  InjectionToken  } from '@angular/core';
import {
    HttpRequest,
    HttpErrorResponse,
    HttpEvent,
    HttpResponse
} from '@angular/common/http';

import { RequestSender } from './request-sender';

/**
 * Type of API Error
 */
export enum ApiErrorEventType {
    ConnectionError = 101,
    WrongArgumentSyntax = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    ServerError = 500,
    UnknownError = 1001
}

/**
 * Type of validation error
 */
export enum ValidationType {
    RequestValidation = 'request',
    ResponseValidation = 'response',
    ParamsValidation = 'params'
}

/**
 * Данные глобального события API.
 */
export interface ApiErrorEventData {

    originalEvent: HttpErrorResponse;

    /**
     * Number of attempts. By default set as 10 and counts down every
     * new failed attempt.
     */
    remainAttemptsNumber: number;

    request: HttpRequest<any>;

    /**
     * Отправитель запроса.
     */
    sender: RequestSender;

    /**
     * Subscriber of request at business layer of app
     */
    subscriber: Subscriber<HttpResponse<any>>;

    /**
     * Channel for additional events, such as progress.
     */
    statusChanges: Subject<HttpEvent<any>> | boolean;

    type: ApiErrorEventType;

    /**
     * @see VIRTUAL_CONNECTION_STATUS
     */
    virtualConnectionStatus: BehaviorSubject<boolean>;
}

/**
 * Событие, сообщающее об ошибках валидации.
 */
export class ValidationError {

    constructor(
        public message: string,

        /**
         *  Тип ошибки
         */
        public type: ValidationType,

        /**
         * Отправитель запроса.
         * todo нужно связать с ApiService. для этого надо вынести это в интерфейс
         */
        public sender: any,

        /**
         * Схема, с помощью которой производилась валидация.
         */
        public schema: any,

        /**
         * Значение, которое не прошло валидацию.
         */
        public value: any,

        /**
         * Сообщения об ошибках валидации.
         */
        public errorMessages: string[] | any[]
    ) {}
}

/**
 * The primary use of {@link ApiErrorHandler} is a handling
 * validation errors and http errors after validation of response.
 * For instance, error response with status 500 have to be validated
 * before, and throws {@link ValidationError} error when validation fails.
 */
export interface ApiErrorHandler {
    /**
     * Handles HTTP-error after validation of response check.
     * @param errorData
     */
    onHttpError(errorData: ApiErrorEventData): void;

    /**
     * When returns `false`, error skips.
     * @param errorData
     */
    onValidationError(errorData: ValidationError): boolean | void;
}

export const resetApiSubscribers = new Subject<any>();

/**
 * @see VIRTUAL_CONNECTION_STATUS
 */
export const virtualConnectionStatus = new BehaviorSubject<boolean>(true);

/**
 * Dependency of {@link ApiService}. Notifies service about need of a cancelation of
 * all active request subscribers.
 */
export const RESET_API_SUBSCRIBERS = new InjectionToken<Subject<void>>('RESET_API_SUBSCRIBERS');

/**
 * Injection token for {@link ApiErrorHandler}.
 * Used in {@link ApiService}.
 */
export const API_ERROR_HANDLER = new InjectionToken<ApiErrorHandler>('API_ERROR_HANDLER');

/**
 * Tool than facilitate manual managing of a virtual connection status.
 * Virtual connection status might be manually changed to `false` (connection off),
 * and further requests will be wait for `true`.
 */
export const VIRTUAL_CONNECTION_STATUS = new InjectionToken<ApiErrorHandler>(
  'VIRTUAL_CONNECTION_STATUS'
);

/**
 * Dependency of {@link ApiService}. Disable validation (JSON-Schema) of
 * request, params and response, when provided `true`.
 */
export const DISABLE_VALIDATION = new InjectionToken<boolean>('DISABLE_VALIDATION');

export const ERROR_EVENTS_PROVIDER = [
    {
        provide: RESET_API_SUBSCRIBERS,
        useValue: resetApiSubscribers
    },
    {
        // by default, no error handler
        provide: API_ERROR_HANDLER,
        useValue: null
    },
    {
        provide: VIRTUAL_CONNECTION_STATUS,
        useValue: virtualConnectionStatus
    }
];
