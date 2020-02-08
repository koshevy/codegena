import { compact } from 'lodash';
import axios, { AxiosResponse } from 'axios';
import * as moxios from 'moxios';

import { getAxiosInstance } from '../helpers';
import {
    ApiUnexpectedContentTypeError,
    ApiUnexpectedStatusCodeError,
    ApiValidationError,
    ApiValidationScopes
} from '../helpers/validate';

// Designed axios-wrapper prototypes and their meta
import createGroupApi,
    * as createGroupApiMeta from './create-group.api';
import updateGroupItem,
  * as updateGroupItemMeta from './update-group-item.api';

// Auto-generated typings, used with axios-wrappers
import * as createGroupApiMocks from './mocks/create-group.api';
import * as updateGroupItemMocks from './mocks/update-group-item.api';

describe.each([
    [
        'Wrapper for PATCH with request and parameters and response',
        updateGroupItem,
        updateGroupItemMeta,
        updateGroupItemMocks
    ],
    [
        'Wrapper for POST with request and response and without params',
        createGroupApi,
        createGroupApiMeta,
        createGroupApiMocks
    ]
])('%s', (testType, wrapperFunction, wrapperMeta, wrapperMocks) => {
    describe('correct response scenarios', () => {
        const moxiosUrlReg = getRegFromPath(wrapperMeta.pathTemplate);

        beforeEach(function () {
            moxios.install();
            moxios.stubRequest(moxiosUrlReg, {
                status: wrapperMocks.expectedCode,
                response: {...wrapperMocks.response},
                headers: {
                    'Content-Type': wrapperMocks.contentType
                }
            });
        });

        afterEach(function () {
            moxios.uninstall();
        });

        it('should pass parameters, request and successful response', function(done) {
            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters
            ]));

            request.then((response: AxiosResponse) => {
                expect(response.data).toEqual(wrapperMocks.response);
                expect(response.status).toBe(wrapperMocks.expectedCode);
                expect(response.config.method).toBe(wrapperMeta.method.toLowerCase());
                expect(response.request.url).toBe(wrapperMocks.expectedUrl);
                done();
            }).catch(error => {
                fail(error);
                done();
            });
        });

        it('should use interceptor of specified Axios instance', function(done) {
            const axiosInstance = axios.create();
            let interceptorRequestCalled: boolean;
            const interceptorRequestSpy = (config) => {
                interceptorRequestCalled = true;

                return config;
            };

            axiosInstance.interceptors.request.use(interceptorRequestSpy);

            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters,
                { axiosInstance }
            ]));

            request.then(() => {
                expect(interceptorRequestCalled).toBeTruthy();
                done();
            }).catch(error => {
                fail(error);
                done();
            });
        });

        it('should use interceptor of default Axios instance', function(done) {
            const axiosInstance = getAxiosInstance();
            let interceptorRequestCalled: boolean;
            const interceptorRequestSpy = (config) => {
                interceptorRequestCalled = true;

                return config;
            };

            axiosInstance.interceptors.request.use(interceptorRequestSpy);

            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters
            ]));

            request.then(() => {
                expect(interceptorRequestCalled).toBeTruthy();
                done();
            }).catch(error => {
                fail(error);
                done();
            });
        });

        it('should use `axiosRequestConfig` with cancel token', function(done) {
            const cancelMessage = 'Request canceled as should';
            const cancelToken = axios.CancelToken.source();

            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters,
                {
                    axiosRequestConfig: {
                        cancelToken: cancelToken.token
                    }
                }
            ]));

            cancelToken.cancel(cancelMessage);

            request.then(() => {
                fail('This request should be canceled');
                done();
            }).catch(error => {
                expect(error.message).toBe(cancelMessage);
                done();
            });
        });

        it('should throw error when params are wrong', function(done) {
            // Skip this step when no parameters supposed to be passed
            if (!wrapperMocks.wrongParameters) {
                done();

                return;
            }

            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.wrongParameters as any
            ]));

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiValidationError) => {
                expect(error).toBeInstanceOf(ApiValidationError);
                expect(error.scope).toBe(ApiValidationScopes.Params);
                done();
            });
        });

        it('should throw error when request is wrong', function(done) {
            const request = wrapperFunction(...compact([
                wrapperMocks.wrongRequest as any,
                wrapperMocks.parameters
            ]));

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiValidationError) => {
                expect(error).toBeInstanceOf(ApiValidationError);
                expect(error.scope).toBe(ApiValidationScopes.Request);
                done();
            });
        });

        it('should throw error when request Content-Type is wrong', function(done) {
            const headers = { 'Content-Type': wrapperMocks.wrongContentType };
            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters,
                {
                    axiosRequestConfig: { headers }
                }
            ]));

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiUnexpectedContentTypeError) => {
                expect(error).toBeInstanceOf(ApiUnexpectedContentTypeError);
                expect(error.contentType).toBe(wrapperMocks.wrongContentType);
                expect(error.expected).toContain(wrapperMocks.contentType);
                expect(error.scope).toBe(ApiValidationScopes.Request);
                done();
            });
        });
    });

    describe('incorrect or error response scenarios', () => {
        const moxiosUrlReg = getRegFromPath(wrapperMeta.pathTemplate);

        beforeEach(function () {
            moxios.install();
        });

        afterEach(function () {
            moxios.uninstall();
        });

        it('should throw error when response Content-Type is wrong', function(done) {
            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters
            ]));

            moxios.stubRequest(moxiosUrlReg, {
                status: wrapperMocks.expectedCode,
                response: {...wrapperMocks.response},
                headers: {
                    'Content-Type': wrapperMocks.wrongContentType
                }
            });

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiUnexpectedContentTypeError) => {
                expect(error).toBeInstanceOf(ApiUnexpectedContentTypeError);
                expect(error.contentType).toBe(wrapperMocks.wrongContentType);
                expect(error.expected).toContain(wrapperMocks.contentType);
                expect(error.scope).toBe(ApiValidationScopes.Response);
                done();
            });
        });

        it('should throw error when response status is wrong', function(done) {
            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters
            ]));

            moxios.stubRequest(moxiosUrlReg, {
                status: wrapperMocks.wrongCode,
                response: {...wrapperMocks.response}
            });

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiUnexpectedStatusCodeError) => {
                expect(error).toBeInstanceOf(ApiUnexpectedStatusCodeError);
                expect(error.statusCode).toBe(String(wrapperMocks.wrongCode));
                expect(error.expected).toContain(String(wrapperMocks.expectedCode));
                done();

            });
        });

        it('should throw error when response is wrong', function(done) {
            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters
            ]));

            moxios.stubRequest(moxiosUrlReg, {
                status: wrapperMocks.expectedCode,
                response: {...wrapperMocks.wrongResponse},
                headers: {
                    'Content-Type': wrapperMocks.contentType
                }
            });

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiValidationError) => {
                expect(error).toBeInstanceOf(ApiValidationError);
                expect(error.scope).toBe(ApiValidationScopes.Response);
                expect(error.errors).toBeInstanceOf(Array);
                done();
            });
        });

        it('should pass correct error response', function(done) {
            const request = wrapperFunction(...compact([
                wrapperMocks.request,
                wrapperMocks.parameters
            ]));

            moxios.stubRequest(moxiosUrlReg, {
                status: wrapperMocks.expectedErrorCode,
                response: {...wrapperMocks.errorResponse},
                headers: {
                    'Content-Type': wrapperMocks.contentType
                }
            });

            request.then((response: AxiosResponse) => {
                expect(response.data).toEqual(wrapperMocks.errorResponse);
                expect(response.status).toBe(wrapperMocks.expectedErrorCode);
                done();
            }).catch(error => {
                fail(error);
                done();
            });
        });
    });
});

// TODO add tests of evironment vars. see ../environment.d.ts

/**
 * Prepares `RegExp` for `moxios` from OAS-path
 *
 * @param pathTemplate
 * @return {RegExp}
 */
function getRegFromPath(pathTemplate: string): RegExp {
    return RegExp(pathTemplate.replace(/\{[^{}]+\}/g, '.*'));
}
