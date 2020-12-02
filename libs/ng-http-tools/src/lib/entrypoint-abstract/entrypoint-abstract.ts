// tslint:disable:unified-signatures
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpEvent,
    HttpResponse,
} from '@angular/common/http';
import { HasContentType } from '@codegena/definitions/aspects';
import { HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { HttpMethod } from "./http-method";
import { EntrypointResponse } from "./entrypoint-response";
import {
    createUrl,
    parseRequestArguments,
    prepareRequestOptions,
} from './utils';
import { RequestOptionsRaw } from './request-options';
import { EntrypointValidationService } from './validation';

type HttpClientResponse<TResponse> = HttpResponse<TResponse> | HttpEvent<TResponse>;

@Injectable()
export abstract class EntrypointAbstract<
    TMethod extends HttpMethod = HttpMethod,
    TParameters extends object = never,
    TRequestBody = TMethod extends 'GET' ? never : unknown,
    TResponse = void
> {
    constructor(
        private httpClient: HttpClient,
        private validationService: EntrypointValidationService,
    ) {}

    protected abstract getMethod(): HttpMethod;
    protected abstract getPathTemplate(): string;
    protected abstract getQueryParameters(): string[];
    protected abstract getServers(): string[];
    protected abstract getDomainSchema(): Observable<object>;
    protected abstract getRequestBodySchema(): HasContentType<JsonSchema> | null;
    protected abstract getParametersSchema(): JsonSchema | null;
    protected abstract getResponseValidationSchema(): HasResponses<HasContentType<JsonSchema>> | null;

    public createUrl(parameters?: TParameters): string {
        return createUrl(
            this.getServers(),
            this.getPathTemplate(),
            parameters || {},
        );
    }

    public request(params: TParameters): EntrypointResponse<TResponse>;
    public request(requestBody: TRequestBody | FormData): EntrypointResponse<TResponse>;
    public request(
        params: TParameters,
        requestBody: TRequestBody | FormData,
    ): EntrypointResponse<TResponse>;

    public request(...args): EntrypointResponse<TResponse> {
        return this.requestWithOptions({}, ...args);
    }

    public requestWithOptions(
        options: RequestOptionsRaw, params: TParameters,
    ): EntrypointResponse<TResponse>;
    public requestWithOptions(
        options: RequestOptionsRaw,
        requestBody: TRequestBody | FormData,
    ) : EntrypointResponse<TResponse>;
    public requestWithOptions(
        options: RequestOptionsRaw, params: TParameters,
        requestBody: TRequestBody | FormData,
    ): EntrypointResponse<TResponse>;
    public requestWithOptions(
        options: RequestOptionsRaw, ...args: any[]
    ): EntrypointResponse<TResponse>;

    public requestWithOptions(
        options: RequestOptionsRaw, ...args
    ): EntrypointResponse<TResponse> {
        const {
            parameters,
            requestBody,
        } = parseRequestArguments<TParameters,
            TRequestBody,
            TResponse
        >(this.getMethod(), ...args);

        const pathTemplate = this.getPathTemplate();
        const queryParameters = this.getQueryParameters();
        const url = this.createUrl(parameters);
        const preparedOptions = prepareRequestOptions<TRequestBody>(
            url,
            parameters,
            requestBody,
            queryParameters,
            options,
        );
        preparedOptions.params = null;

        return this.validationService.validateRequestBody(
            preparedOptions,
            this.getRequestBodySchema(),
            this.getDomainSchema(),
        ).pipe(
            switchMap(() => this.validationService.validateParams(
                parameters, this.getParametersSchema(), this.getDomainSchema(),
            )),
            switchMap<void, Observable<HttpClientResponse<TResponse>>>(() =>
                this.httpClient.request<TResponse>(
                    this.getMethod(), url, preparedOptions,
                ),
            ),
            switchMap(response => this.validateEvent(response)),
            catchError((error: HttpErrorResponse | unknown) =>
                this.catchError(error),
            ),
        );
    }

    private validateEvent(
        response: HttpEvent<TResponse>,
    ): Observable<HttpEvent<TResponse>> {
        if (response instanceof HttpResponse) {
            return this.validationService.validateResponse(
                response,
                this.getResponseValidationSchema(),
                this.getDomainSchema(),
            ).pipe(
                map(() => response),
            )
        }

        return of(response);
    }

    private catchError(
        error: HttpErrorResponse | unknown,
    ): EntrypointResponse<TResponse> {
        if (error instanceof HttpErrorResponse) {
            return this.validationService
                .validateResponse(
                    error,
                    this.getResponseValidationSchema(),
                    this.getDomainSchema(),
                )
                .pipe(switchMap(() => of(error)))
        }

        return throwError(error);
    }
}
