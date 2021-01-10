import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { Oas3Server } from '@codegena/definitions/oas3';
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { CreateGroupItemParameters } from './create-group-item-parameters';
import { CreateGroupItemRequest } from './create-group-item-request';
import { CreateGroupItemResponse } from './create-group-item-response';

@Injectable()
export class CreateGroupItemBackendService extends EntrypointAbstract<
    'POST',
    CreateGroupItemParameters,
    CreateGroupItemRequest,
    CreateGroupItemResponse
> {
    protected getMethod(): HttpMethod {
        return 'POST';
    }

    protected getPathTemplate(): string {
        return '/group/{groupId}/item';
    }

    protected getQueryParameters(): string[] {
        return ['forceSave'];
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
        return {
            'application/json': {
                $ref: 'todo-app#/components/schemas/ToDoTaskBlank',
                $id: 'createGroupItem_request_application_json',
            },
        };
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
            $id: 'createGroupItem_parameters',
            properties: {
                groupId: {
                    $ref: 'todo-app#/components/schemas/Uid',
                },
                forceSave: {
                    type: ['boolean', 'null'],
                    default: null,
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
            '201': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/ToDoTask',
                    $id: 'createGroupItem_response_application_json',
                },
            },
            '400': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorBadRequest',
                    $id: 'createGroupItem_response_application_json',
                },
            },
            '404': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorNotFound',
                    $id: 'createGroupItem_response_application_json',
                },
            },
            '409': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorConflict',
                    $id: 'createGroupItem_response_application_json',
                },
            },
            '500': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorServer',
                    $id: 'createGroupItem_response_application_json',
                },
            },
        };
    }
}
