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
    CreateGroupRequest,
    CreateGroupResponse
} from '../auto-generated/typings';

import { schema as externalSchema } from './schema.b4c655ec1635af1be28bd6';

export const schemasBundle: ValidationSchemasBundle = {
    params: null,
    request: {
        'application/json': {
            $ref:
                'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoGroupBlank'
        }
    },
    response: {
        '201': {
            'application/json': {
                $ref: 'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoGroup'
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

export const method = 'POST';
export const defaultContentType = 'application/json';
export const queryParams = [];
export const pathTemplate = '/group';
export const envRedefineBaseUrl = environment.redefineBaseUrl;
export const servers = ['http://localhost:3000'];

export type CreateGroupAxiosResponse = AxiosResponse<CreateGroupResponse>;

/**
 * @param body
 * @param axiosRequestConfig
 * @param axiosInstance
 * @throws ApiUnexpectedContentTypeError
 * @throws ApiUnexpectedStatusCodeError
 * @throws ApiValidationError
 * @return
 * Promise-base response via `axios`
 */
export default async function createGroupApi(
    body?: CreateGroupRequest,
    {
        axiosRequestConfig,
        axiosInstance
    }: ApiRequestOptions = {}
): Promise<CreateGroupAxiosResponse> {
    const params = null;

    // logic of request moved to common helper
    return doRequest<
        CreateGroupRequest,
        null,
        CreateGroupResponse
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
