import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { Oas3Server } from '@codegena/definitions/oas3';
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { RewriteGroupItemParameters } from './rewrite-group-item-parameters';
import { RewriteGroupItemRequest } from './rewrite-group-item-request';
import { RewriteGroupItemResponse } from './rewrite-group-item-response';

@Injectable()
export class RewriteGroupItemBackendService extends EntrypointAbstract<
    'PUT',
    RewriteGroupItemParameters,
    RewriteGroupItemRequest,
    RewriteGroupItemResponse
> {
    protected getMethod(): HttpMethod {
        return 'PUT';
    }

    protected getPathTemplate(): string {
        return '/group/{groupId}/item/{itemId}';
    }

    protected getQueryParameters(): string[] {
        return ['forceSave'];
    }

    protected getServers(): Oas3Server[] {
        return [
            {
                environment: 'local',
                description: 'Base local server',
                url: 'https://local.todo-codegena-example.com',
            },
            {
                environment: 'dev',
                description: 'Development server',
                url: 'https://dev.todo-codegena-example.com',
            },
            {
                environment: 'prod',
                description: 'Development server',
                url: 'https://todo-codegena-example.com',
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
                $id: 'rewriteGroupItem_request_application_json',
            },
        };
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
            $id: 'rewriteGroupItem_parameters',
            properties: {
                groupId: {
                    $ref: 'todo-app#/components/schemas/Uid',
                },
                itemId: {
                    $ref: 'todo-app#/components/schemas/Uid',
                },
                forceSave: {
                    type: ['boolean', 'null'],
                    default: null,
                },
            },
            required: ['groupId', 'itemId'],
            type: 'object',
        };
    }

    protected getResponseValidationSchema(): HasResponses<
        HasContentType<JsonSchema>
    > | null {
        return {
            '200': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/ToDoTask',
                    $id: 'rewriteGroupItem_response_application_json',
                },
            },
            '400': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorBadRequest',
                    $id: 'rewriteGroupItem_response_application_json',
                },
            },
            '404': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorNotFound',
                    $id: 'rewriteGroupItem_response_application_json',
                },
            },
            '409': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorConflict',
                    $id: 'rewriteGroupItem_response_application_json',
                },
            },
            '500': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorServer',
                    $id: 'rewriteGroupItem_response_application_json',
                },
            },
        };
    }
}
