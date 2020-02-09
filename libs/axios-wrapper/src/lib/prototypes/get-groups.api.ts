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
    GetGroupsParameters,
    GetGroupsResponse
} from '../auto-generated/typings';

import { schema as externalSchema } from './schema.b4c655ec1635af1be28bd6';

export const schemasBundle: ValidationSchemasBundle = {
    params: {
        properties: {
            isComplete: { type: ['boolean', 'null'], default: null },
            withItems: { type: ['boolean', 'null'], default: false }
        },
        required: [],
        type: 'object'
    },
    request: null,
    response: {
        '200': {
            'application/json': {
                type: 'array',
                items: {
                    $ref:
                        'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoGroup'
                }
            }
        },
        '400': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorBadRequest'
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

export const method = 'GET';
export const defaultContentType = 'application/json';
export const queryParams = ['isComplete', 'withItems'];
export const pathTemplate = '/group';
export const envRedefineBaseUrl = environment.redefineBaseUrl;
export const servers = ['http://localhost:3000'];

/**
 * @param params
 * @param axiosRequestConfig
 * @param axiosInstance
 * @throws ApiUnexpectedContentTypeError
 * @throws ApiUnexpectedStatusCodeError
 * @throws ApiValidationError
 * @return
 * Promise-base response via `axios`
 */
export default async function getGroups(
    params?: GetGroupsParameters,
    {
        axiosRequestConfig,
        axiosInstance
    }: ApiRequestOptions = {}
): Promise<AxiosResponse<GetGroupsResponse>> {
    const body = null;

    // logic of request moved to common helper
    return doRequest({
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
