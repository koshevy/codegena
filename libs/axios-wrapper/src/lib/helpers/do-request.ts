/**
 * @module DoRequestHelper
 *
 * Extracted logic of request in wrapper templates.
 */

import {
    AxiosInstance,
    AxiosResponse,
    Method
} from "axios";

import { defaultAxiosConfig } from '../configs';
import {
    AxiosSafeRequestConfig,
    createUrl,
    getAxiosInstance,
    getBaseUrl,
    getContentType
} from "./index";
import {
    ValidationSchemasBundle,
    validateParams,
    validateRequest,
    validateResponse
} from "./validate";

export interface ApiRequestOptions {
    axiosRequestConfig?: AxiosSafeRequestConfig,
    axiosInstance?: AxiosInstance
}

export interface DoRequestArguments<Body, Params, Response> {
    axiosRequestConfig?: AxiosSafeRequestConfig;
    axiosInstance?: AxiosInstance;
    body?: Body;
    defaultContentType: string;
    envRedefineBaseUrl: CodegenaAxiosWrapperEnvironment['redefineBaseUrl'];
    externalSchema: any;
    method: Method;
    params?: Params;
    pathTemplate: string;
    schemasBundle: ValidationSchemasBundle;
    servers: string[];
}

/**
 * Extracted logic of request performing from wrappers.
 * No need to be tested: have been testing through working prototypes of wrappers.
 * @see updateGroupItem
 *
 * @param args
 * Prepared params from "wrapper"
 * @return
 */
export async function doRequest<Request, Params, Response>(
    args: DoRequestArguments<Request, Params, Response>
): Promise<AxiosResponse<Response>> {
    const {
        defaultContentType,
        envRedefineBaseUrl,
        externalSchema,
        method,
        pathTemplate,
        params,
        body,
        schemasBundle,
        servers
    } = args;
    let {
        axiosRequestConfig,
        axiosInstance
    } = args;

    if (!axiosRequestConfig) {
        axiosRequestConfig = {};
    }

    const {
        path,
        unusedParameters
    } = createUrl(pathTemplate, params || {});
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
        validateParams(schemasBundle, params, externalSchema),
        validateRequest(schemasBundle, contentType, body, externalSchema),
    ]);

    return axiosInstance.request<Response>({
        ...axiosRequestConfig,
        baseURL,
        headers,
        method,
        params: unusedParameters,
        url: path,
        data: body,
        validateStatus: () => true
    }).then(async (response: AxiosResponse<Response>) => {
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
