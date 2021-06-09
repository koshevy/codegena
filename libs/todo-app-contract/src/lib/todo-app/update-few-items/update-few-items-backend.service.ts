import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { Oas3Server } from '@codegena/definitions/oas3';
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { UpdateFewItemsParameters } from './update-few-items-parameters';
import { UpdateFewItemsRequest } from './update-few-items-request';
import { UpdateFewItemsResponse } from './update-few-items-response';

@Injectable()
export class UpdateFewItemsBackendService extends EntrypointAbstract<
    'POST',
    UpdateFewItemsParameters,
    UpdateFewItemsRequest,
    UpdateFewItemsResponse
> {
    protected getMethod(): HttpMethod {
        return 'POST';
    }

    protected getPathTemplate(): string {
        return '/group/items';
    }

    protected getQueryParameters(): string[] {
        return ['forceSave'];
    }

    protected getServers(): Oas3Server[] {
        return [
            {
                environment: 'local',
                description: 'Local server for tasks writing',
                url: 'http://local.write.todo-app-example.com',
            },
        ];
    }

    protected getDomainSchema(): Observable<object> {
        return from(
            import('../domain-schema').then(({ domainSchema }) => domainSchema)
        );
    }

    protected getRequestBodySchema(): HasContentType<JsonSchema> | null {
        return {
            'application/json': {
                type: 'array',
                items: {
                    $ref: 'todo-app#/components/schemas/ToDoTask',
                },
                $id: 'updateFewItems_request_application_json',
            },
        };
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
            $id: 'updateFewItems_parameters',
            properties: {
                forceSave: {
                    type: ['boolean', 'null'],
                    default: null,
                },
            },
            required: [],
            type: 'object',
        };
    }

    protected getResponseValidationSchema(): HasResponses<
        HasContentType<JsonSchema>
    > | null {
        return {
            '200': {
                'application/json': {
                    type: 'array',
                    items: {
                        $ref: 'todo-app#/components/schemas/ToDoTask',
                    },
                    $id: 'updateFewItems_response_application_json',
                },
            },
            '400': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorBadRequest',
                    $id: 'updateFewItems_response_application_json',
                },
            },
            '404': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorNotFound',
                    $id: 'updateFewItems_response_application_json',
                },
            },
            '409': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorConflict',
                    $id: 'updateFewItems_response_application_json',
                },
            },
            '500': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorServer',
                    $id: 'updateFewItems_response_application_json',
                },
            },
        };
    }
}
