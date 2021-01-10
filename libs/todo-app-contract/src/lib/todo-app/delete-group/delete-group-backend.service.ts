import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { Oas3Server } from '@codegena/definitions/oas3';
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { DeleteGroupParameters } from './delete-group-parameters';
import { DeleteGroupResponse } from './delete-group-response';

@Injectable()
export class DeleteGroupBackendService extends EntrypointAbstract<
    'DELETE',
    DeleteGroupParameters,
    never,
    DeleteGroupResponse
> {
    protected getMethod(): HttpMethod {
        return 'DELETE';
    }

    protected getPathTemplate(): string {
        return '/group/{groupId}';
    }

    protected getQueryParameters(): string[] {
        return [];
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
            $id: 'deleteGroup_parameters',
            properties: {
                groupId: {
                    $ref: 'todo-app#/components/schemas/Uid',
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
            '202': {
                'application/json': {
                    type: 'null',
                    $id: 'deleteGroup_response_application_json',
                },
            },
            '400': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorBadRequest',
                    $id: 'deleteGroup_response_application_json',
                },
            },
            '404': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorNotFound',
                    $id: 'deleteGroup_response_application_json',
                },
            },
            '409': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorConflict',
                    $id: 'deleteGroup_response_application_json',
                },
            },
            '500': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorServer',
                    $id: 'deleteGroup_response_application_json',
                },
            },
        };
    }
}
