import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { HasResponses, HasContentType } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { AjvWrapperService } from './ajv-wrapper.service';
import { ValidationError } from './validation-error';
import { RequestOptions } from '../request-options';

@Injectable()
export class EntrypointValidationService {
    constructor(
        private ajvWrapper: AjvWrapperService,
    ) {}

    public validateRequestBody(
        options: RequestOptions<unknown>,
        schema: HasContentType<JsonSchema> | null,
        domainSchemas$: Observable<object>,
    ): Observable<void> {
        if (!schema) {
            return of<void>(undefined);
        }

        const contentType = options.headers.get('content-type');
        const [contentTypeKey] = (contentType || 'application/json').split(';');

        const schemaByContentType = schema?.[contentTypeKey] || schema?.['default'];
        const value = options.body;

        if (!schemaByContentType) {
            return throwError(new ValidationError(
                `No request schema for content-type: ${contentType}!`,
                value,
                schema,
                [],
            ));
        }

        // FormData doesn't get validated yet
        if (value instanceof FormData) {
            return of<void>(undefined);
        }

        return this.validate(value, schemaByContentType, domainSchemas$);
    }

    public validateParams(
        params: object | undefined | null,
        schema: JsonSchema | null,
        domainSchemas$: Observable<object>,
    ): Observable<void> {
        if (!schema) {
            return of<void>(undefined);
        }

        return this.validate(params, schema, domainSchemas$);
    }

    public validateResponse(
        response: HttpResponse<unknown> | HttpErrorResponse,
        schema: HasResponses<HasContentType<JsonSchema>>,
        domainSchemas$: Observable<object>,
    ): Observable<void> {
        if (!schema) {
            return of<void>(undefined);
        }

        const { status } = response;

        // "no connection" errors have not to be validated
        if (!status) {
            return of<void>(undefined);
        }

        const schemaByResponse: HasContentType<JsonSchema> | null = schema?.[status]
            ?? schema?.['default']

        if (!schemaByResponse) {
            return throwError(new ValidationError(
                `No request schema for response: ${status}!`,
                response,
                schema,
                [],
            ));
        }

        const contentType = response.headers.get('content-type')?.split(';')?.[0]
            ?? Object.keys(schemaByResponse || {})?.[0]

        if (!contentType) {
            return throwError(new ValidationError(
                `Can't get Content-type!`,
                response,
                schema,
                [],
            ));
        }

        const schemaByContentType = schemaByResponse?.[contentType]
            || schemaByResponse?.['default'];

        if (!schemaByContentType) {
            return  throwError(new ValidationError(
                `No request schema for content-type: ${contentType}!`,
                response,
                schemaByResponse,
                [],
            ));
        }

        const value = (response instanceof HttpResponse)
            ? response.body
            : response.error;

        return this.validate(value, schemaByContentType, domainSchemas$);
    }

    private validate(
        value: unknown,
        schema: JsonSchema,
        domainSchemas$: Observable<object>,
    ): Observable<void> {
        return domainSchemas$.pipe(
            map<object, void>(domainSchemas =>
                this.ajvWrapper.validate(value, schema, domainSchemas),
            ),
        );
    }
}
