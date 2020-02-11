import { AxiosResponse } from 'axios';
import * as _ from 'lodash';

import {
    ApiUnexpectedStatusCodeError,
    ApiUnexpectedContentTypeError,
    ApiValidationScopes
} from './validate';

import { getContentType } from './index';

export type CodeRange = SuccessCodeRange | ErrorCodeRange;

/**
 * todo extract in common typings library in @codegena scope
 * Success code you can use for catching success response.
 * If you need error code, use error catching.
 */
export type SuccessCodeRange = | 100 | 101 | 102
      | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226
      | 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;

/**
 * todo extract in common typings library in @codegena scope
 * Error code you can use for catching error response.
 */
export type ErrorCodeRange = | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408
     | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417
     | 418 | 419 | 420 | 421 | 422 | 423 | 424 | 426 | 428
     | 429 | 431 | 449 | 451 | 499
     | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508
     | 509 | 510 | 511 | 520 | 521 | 522 | 523 | 524 | 525 | 526;

export type AbstractResponseType<
    TCode extends number = number,
    TContentType extends string = string
> = any;

/**
 * Pick {@link AxiosResponse.data } when status is expected,
 * or throw {@link ApiUnexpectedStatusCodeError} otherwise.
 *
 * @param expectedCodes
 * @return
 * @throws ApiUnexpectedStatusCodeError
 */
export function pickResponseBody<
    TResponse extends AbstractResponseType<CodeRange, string>
>(
    expectedCodes?: CodeRange | CodeRange[]
): <T extends TResponse>(response: AxiosResponse<T>) => T;

/**
 * Pick {@link AxiosResponse.data} when content-type is expected,
 * or throw {@link ApiUnexpectedContentTypeError} otherwise.
 *
 * @param expectedContentTypes
 * @return
 */
export function pickResponseBody<
    TResponse extends AbstractResponseType<CodeRange, string>
>(
    expectedContentTypes?: string | string[]
): <T extends TResponse>(response: AxiosResponse<T>) => T;

/**
 * Pick {@link AxiosResponse.data} when content-type and status code are expected,
 * or throw {@link ApiUnexpectedStatusCodeError} / {@link ApiUnexpectedContentTypeError} otherwise.
 *
 * @param expectedCodes
 * @param expectedContentTypes
 * @return
 */
export function pickResponseBody<
    TResponse extends AbstractResponseType<CodeRange, string>
>(
    expectedCodes?: CodeRange | CodeRange[],
    expectedContentTypes?: string | string[]
): <T extends TResponse>(response: AxiosResponse<T>) => T;

export function pickResponseBody<
    TResponse extends AbstractResponseType<CodeRange, string>
>(
    ...args
): <T extends TResponse>(response: AxiosResponse<T>) => T {
    let codes, contentTypes;
    const simply = _.map(args, val => _.isArray(val) ? val[0] : val);

    if ('string' === typeof simply[0]) {
        codes = null;
        contentTypes = args[0];
    } else if ('number' === typeof simply[0]) {
        codes = args[0];
        contentTypes = ('string' === typeof simply[1]) ? args[1] : null;
    }

    return (response) => {
        if (codes && !_.isArray(codes)) {
            codes = [codes];
        }

        if (contentTypes && !_.isArray(contentTypes)) {
            contentTypes = [contentTypes];
        }

        if (codes && !_.includes(codes, response.status)) {
            throw new ApiUnexpectedStatusCodeError(
                String(response.status),
                _.map(codes, code => String(code)),
                response.data
            );
        }

        const contentType = getContentType(response.headers);

        if (contentTypes && !_.includes(contentTypes, contentType)) {
            throw new ApiUnexpectedContentTypeError(
                ApiValidationScopes.Response,
                contentType,
                contentTypes,
                response.data
            );
        }

        return response.data;
    }
}

// TODO implement tapResponse function
