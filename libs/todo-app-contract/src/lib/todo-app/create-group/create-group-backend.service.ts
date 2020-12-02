import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { CreateGroupRequest } from './create-group-request';
import { CreateGroupResponse } from './create-group-response';

@Injectable()
export class CreateGroupBackendService extends EntrypointAbstract<
    'POST',
    never,
    CreateGroupRequest,
    CreateGroupResponse
> {
    protected getMethod(): HttpMethod {
        return 'POST';
    }

    protected getPathTemplate(): string {
        return '/group';
    }

    protected getQueryParameters(): string[] {
        return [];
    }

    protected getServers(): string[] {
        return ['http://localhost:3000'];
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
                $id: 'createGroup_request_application_json',
            },
        };
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
            $id: 'createGroup_parameters',
        };
    }

    protected getResponseValidationSchema(): HasResponses<
        HasContentType<JsonSchema>
    > | null {
        return {
            '201': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/ToDoGroup',
                    $id: 'createGroup_response_application_json',
                },
            },
            '400': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorBadRequest',
                    $id: 'createGroup_response_application_json',
                },
            },
            '500': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorServer',
                    $id: 'createGroup_response_application_json',
                },
            },
        };
    }
}