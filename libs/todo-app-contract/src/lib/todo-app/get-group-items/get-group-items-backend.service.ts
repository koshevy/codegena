import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { Oas3Server } from '@codegena/definitions/oas3';
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { GetGroupItemsParameters } from './get-group-items-parameters';
import { GetGroupItemsResponse } from './get-group-items-response';

@Injectable()
export class GetGroupItemsBackendService extends EntrypointAbstract<
    'GET',
    GetGroupItemsParameters,
    never,
    GetGroupItemsResponse
> {
    protected getMethod(): HttpMethod {
        return 'GET';
    }

    protected getPathTemplate(): string {
        return '/group/{groupId}/item';
    }

    protected getQueryParameters(): string[] {
        return ['isComplete'];
    }

    protected getServers(): Oas3Server[] {
        return [
            {
                environment: 'local',
                description: 'Base local server',
                url: 'http://local.todo-app-example.com',
            },
        ];
    }

    protected getDomainSchema(): Observable<object> {
        return from(
            import('../domain-schema').then(({ domainSchema }) => domainSchema)
        );
    }

    protected getRequestBodySchema(): HasContentType<JsonSchema> | null {
        return null;
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
            $id: 'getGroupItems_parameters',
            properties: {
                groupId: {
                    $ref: 'todo-app#/components/schemas/Uid',
                },
                isComplete: {
                    type: 'boolean',
                },
            },
            required: ['groupId'],
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
                    $id: 'getGroupItems_response_application_json',
                },
            },
            '400': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorBadRequest',
                    $id: 'getGroupItems_response_application_json',
                },
            },
            '404': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorNotFound',
                    $id: 'getGroupItems_response_application_json',
                },
            },
            '500': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorServer',
                    $id: 'getGroupItems_response_application_json',
                },
            },
        };
    }
}
