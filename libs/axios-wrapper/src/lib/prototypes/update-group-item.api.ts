import { AxiosResponse, AxiosRequestConfig } from 'axios';

// tslint:disable-next-line
import { defaultAxiosConfig } from '@codegena/axios-wrapper/src/lib/configs/index';
import {
    createUrl,
    getAxiosInstance,
    getBaseUrl,
    getGlobalEnvironment
    // tslint:disable-next-line
} from '@codegena/axios-wrapper/src/lib/helpers/index';
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
import { schema as domainSchema } from './schema.b4c655ec1635af1be28bd6';

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
export const queryParams = [];
export const pathTemplate = '/group/{groupId}/item/{itemId}';
export const envRedefineBaseUrl = environment.redefineBaseUrl;
export const servers = ['http://localhost:3000'];

/**
 * @throws ApiUnexpectedContentTypeError
 * @throws ApiUnexpectedStatusCodeError
 * @throws ApiValidationError
 */
export default async function updateGroupItem(
    request: UpdateGroupItemRequest,
    parameters?: UpdateGroupItemParameters,
    axiosConfig: AxiosRequestConfig = defaultAxiosConfig
): Promise<AxiosResponse<UpdateGroupItemResponse>> {

    const {
        path,
        unusedParameters
    } = createUrl(pathTemplate, parameters || {});
    const baseURL = getBaseUrl(servers, envRedefineBaseUrl);

    return getAxiosInstance(axiosConfig).request({
        baseURL,
        method,
        params: unusedParameters,
        url: path,
        data: request
    });
}
