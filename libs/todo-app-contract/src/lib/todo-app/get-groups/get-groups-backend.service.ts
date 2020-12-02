import { from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { GetGroupsParameters } from './get-groups-parameters';
import { GetGroupsResponse } from './get-groups-response';

@Injectable()
export class GetGroupsBackendService extends EntrypointAbstract<
    'GET',
    GetGroupsParameters,
    never,
    GetGroupsResponse
> {
    protected getMethod(): HttpMethod {
        return 'GET';
    }

    protected getPathTemplate(): string {
        return '/group';
    }

    protected getQueryParameters(): string[] {
        return ['isComplete', 'withItems'];
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
        return null;
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
            $id: 'getGroups_parameters',
            properties: {
                isComplete: {
                    type: 'boolean',
                },
                withItems: {
                    type: 'boolean',
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
                        $ref: 'todo-app#/components/schemas/ToDoGroup',
                    },
                    $id: 'getGroups_response_application_json',
                },
            },
            '400': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorBadRequest',
                    $id: 'getGroups_response_application_json',
                },
            },
            '500': {
                'application/json': {
                    $ref: 'todo-app#/components/schemas/HttpErrorServer',
                    $id: 'getGroups_response_application_json',
                },
            },
        };
    }
}
