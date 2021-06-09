import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { Oas3Server } from '@codegena/definitions/oas3';
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { RewriteGroupParameters } from './rewrite-group-parameters';
import { RewriteGroupRequest } from './rewrite-group-request';
import { RewriteGroupResponse } from './rewrite-group-response';

@Injectable()
export class RewriteGroupBackendService extends EntrypointAbstract<
    'PUT',
    RewriteGroupParameters,
    RewriteGroupRequest,
    RewriteGroupResponse
> {
    protected getMethod(): HttpMethod {
        return 'PUT';
    }

    protected getPathTemplate(): string {
        return '/group/{groupId}';
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
                $ref: 'todo-app#/components/schemas/ToDoGroupBlank',
                $id: 'rewriteGroup_request_application_json',
            },
        };
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
            $id: 'rewriteGroup_parameters',
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
            '200': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/ToDoGroup',
                    $id: 'rewriteGroup_response_application_json',
                },
            },
            '204': {
                'application/json': {
                    type: 'null',
                    $id: 'rewriteGroup_response_application_json',
                },
            },
            '400': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorBadRequest',
                    $id: 'rewriteGroup_response_application_json',
                },
            },
            '404': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorNotFound',
                    $id: 'rewriteGroup_response_application_json',
                },
            },
            '409': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorConflict',
                    $id: 'rewriteGroup_response_application_json',
                },
            },
            '500': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorServer',
                    $id: 'rewriteGroup_response_application_json',
                },
            },
        };
    }
}
