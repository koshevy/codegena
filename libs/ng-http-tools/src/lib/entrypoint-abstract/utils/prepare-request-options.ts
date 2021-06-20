import { HttpClient, HttpHeaders } from "@angular/common/http";
import { flow, pick } from 'lodash';
import { serializeFormData } from './serialize-form-data';
import {
    RequestOptionsRaw,
    RequestOptions,
} from '../request-options';

export const defaultContentType = 'application/json';
export const shouldBeSerializedContentTypes = [
    'application/x-www-form-urlencoded',
    'multipart/form-data',
];

/**
 * Prepares options for {@link HttpClient.request}
 */
export function prepareRequestOptions<TRequestBody = unknown>(
    url: string,
    parameters: object | null,
    requestBody: any,
    queryParameters: string[],
    rawOptions: RequestOptionsRaw,
): RequestOptions<TRequestBody> {
    const contentType = getContentType(rawOptions);
    const actualizeOptions = flow([
        options => actualizeContentType(options, contentType),
        options => actualizeParameters(options, parameters, queryParameters),
        options => actualizeRequestBody(options, requestBody, contentType),
        options => addRequiredParameters(options),
    ]);

    return actualizeOptions(rawOptions);
}

function getContentType(options: RequestOptionsRaw): string {
    return  options.headers?.get('content-type') || defaultContentType;
}

function actualizeContentType(
    options: RequestOptionsRaw,
    contentType: string,
): RequestOptionsRaw {
    const headers = options.headers || new HttpHeaders();

    return {
        ...options,
        headers: headers.set('content-type', contentType),
    };
}

function actualizeParameters(
    options: RequestOptionsRaw,
    parameters: object | null,
    queryParameters: string[],
): RequestOptionsRaw {
    if (!queryParameters?.length) {
        return options;
    }

    const serializedParameters = serializeFormData(
        pick(parameters, queryParameters),
    );

    return {...options, params: serializedParameters || {}};
}

function actualizeRequestBody(
    options: RequestOptionsRaw,
    rawRequestBody: any,
    contentType: string,
): RequestOptionsRaw {
    if (!rawRequestBody) {
        return options;
    }

    let requestBody;
    if (shouldBeSerializedContentTypes.includes(contentType)
            && !(rawRequestBody instanceof FormData)) {

        requestBody = serializeFormData(rawRequestBody);
    } else {
        requestBody = rawRequestBody;
    }

    return {...options, body: requestBody}
}

function addRequiredParameters(options: RequestOptionsRaw): RequestOptionsRaw {
    return {
        ...options,
        // observe is always 'response' because response
        // required for validation
        observe: 'response',
    };
}
