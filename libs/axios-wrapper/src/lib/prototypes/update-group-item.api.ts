import { AxiosResponse } from 'axios';

import {
    ApiRequestOptions,
    doRequest
// tslint:disable-next-line
} from '@codegena/axios-wrapper/src/lib/helpers/do-request';
// tslint:disable-next-line
import { getGlobalEnvironment } from '@codegena/axios-wrapper/src/lib/helpers';
import {
    ApiUnexpectedContentTypeError,
    ApiUnexpectedStatusCodeError,
    ApiValidationError,
    ValidationSchemasBundle
// tslint:disable-next-line
} from '@codegena/axios-wrapper/src/lib/helpers/validate';

// Schemas and types
import {
    UpdateGroupItemParameters,
    UpdateGroupItemRequest,
    UpdateGroupItemResponse,
} from '../auto-generated/typings';

import { schema as externalSchema } from './schema.b4c655ec1635af1be28bd6';

export const schemasBundle: ValidationSchemasBundle = {
    params: {
        properties: {
            groupId: {
                $ref: 'schema.b4c655ec1635af1be28bd6#/components/schemas/Uid'
            },
            itemId: {
                $ref: 'schema.b4c655ec1635af1be28bd6#/components/schemas/Uid'
            },
            forceSave: { type: ['boolean', 'null'], default: null }
        },
        required: ['groupId', 'itemId'],
        additionalProperties: false,
        type: 'object'
    },
    request: {
        'application/json': {
            $ref:
                'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoTaskBlank'
        }
    },
    response: {
        '200': {
            'application/json': {
                $ref: 'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoTask'
            }
        },
        '400': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorBadRequest'
            }
        },
        '404': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorNotFound'
            }
        },
        '409': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorConflict'
            }
        },
        '500': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorServer'
            }
        }
    }
};

const environment = getGlobalEnvironment();

export const method = 'PATCH';
export const defaultContentType = 'application/json';
export const queryParams = [];
export const pathTemplate = '/group/{groupId}/item/{itemId}';
export const envRedefineBaseUrl = environment.redefineBaseUrl;
export const servers = ['http://localhost:3000'];

export type UpdateGroupItemAxiosResponse = AxiosResponse<UpdateGroupItemResponse>;

/**
 * @param body
 * @param params
 * @param axiosRequestConfig
 * @param axiosInstance
 * @throws ApiUnexpectedContentTypeError
 * @throws ApiUnexpectedStatusCodeError
 * @throws ApiValidationError
 * @return
 * Promise-base response via `axios`
 */
export async function updateGroupItem(
    body?: UpdateGroupItemRequest,
    params?: UpdateGroupItemParameters,
    {
        axiosRequestConfig,
        axiosInstance
    }: ApiRequestOptions = {}
): Promise<UpdateGroupItemAxiosResponse> {
    // logic of request moved to common helper
    return doRequest<
        UpdateGroupItemRequest,
        UpdateGroupItemParameters,
        UpdateGroupItemResponse
    >({
        axiosRequestConfig,
        axiosInstance,
        defaultContentType,
        envRedefineBaseUrl,
        externalSchema,
        method,
        pathTemplate,
        params,
        body,
        schemasBundle,
        servers
    });
}

export default updateGroupItem;
