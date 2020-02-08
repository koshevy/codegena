import {
    AxiosResponse,
    AxiosRequestConfig,
    AxiosInstance
} from 'axios';

// tslint:disable-next-line
import { defaultAxiosConfig } from '@codegena/axios-wrapper/src/lib/configs';
import {
    AxiosSafeRequestConfig,
    createUrl,
    getAxiosInstance,
    getBaseUrl,
    getContentType,
    getGlobalEnvironment
    // tslint:disable-next-line
} from '@codegena/axios-wrapper/src/lib/helpers';
import {
    ApiUnexpectedContentTypeError,
    ApiUnexpectedStatusCodeError,
    ApiValidationError,
    ValidationSchemasBundle,
    validateParams,
    validateRequest,
    validateResponse
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

interface ApiRequestOptions {
    axiosRequestConfig?: AxiosSafeRequestConfig,
    axiosInstance?: AxiosInstance
}

/**
 * @param request
 * @param parameters
 * @param axiosRequestConfig
 * @param axiosInstance
 * @throws ApiUnexpectedContentTypeError
 * @throws ApiUnexpectedStatusCodeError
 * @throws ApiValidationError
 * @return
 * Promise-base response via `axios`
 */
export default async function updateGroupItem(
    request?: UpdateGroupItemRequest,
    parameters?: UpdateGroupItemParameters,
    {
        axiosRequestConfig,
        axiosInstance
    }: ApiRequestOptions = {}
): Promise<AxiosResponse<UpdateGroupItemResponse>> {

    if (!axiosRequestConfig) {
        axiosRequestConfig = {};
    }

    const {
        path,
        unusedParameters
    } = createUrl(pathTemplate, parameters || {});
    const baseURL = getBaseUrl(servers, envRedefineBaseUrl);
    const headers = { ...(axiosRequestConfig.headers || {}) };
    let contentType = getContentType(headers);

    if (!axiosInstance) {
        axiosInstance = getAxiosInstance(defaultAxiosConfig);
    }

    if (!contentType) {
        contentType = defaultContentType;
        if (!axiosRequestConfig.headers) {
            axiosRequestConfig.headers = {};
        }

        headers['Content-Type'] = contentType;
    }

    await Promise.all([
        validateParams(schemasBundle, parameters, externalSchema),
        validateRequest(schemasBundle, contentType, request, externalSchema),
    ]);

    return axiosInstance.request({
        ... axiosRequestConfig,
        baseURL,
        headers,
        method,
        params: unusedParameters,
        url: path,
        data: request,
        validateStatus: () => true
    }).then(async (response: AxiosResponse) => {
        await validateResponse(
            schemasBundle,
            String(response.status),
            getContentType(response.headers),
            response.data,
            externalSchema
        );

        return response;
    });

}
