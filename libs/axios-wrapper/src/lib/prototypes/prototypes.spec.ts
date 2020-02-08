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
import updateGroupItem,
  * as updateGroupItemMeta from './update-group-item.api';

// Auto-generated typings, used with axios-wrappers
import * as updateGroupItemMocks from './mocks/update-group-item.api';

describe('Wrapper for PATCH with request and parameters and response', () => {
    describe('correct response scenarios', () => {

        const moxiosUrlReg = getRegFromPath(updateGroupItemMeta.pathTemplate);

        beforeEach(function () {
            moxios.install();
            moxios.stubRequest(moxiosUrlReg, {
                status: updateGroupItemMocks.expectedCode,
                response: {...updateGroupItemMocks.response},
                headers: {
                    'Content-Type': updateGroupItemMocks.contentType
                }
            });
        });

        afterEach(function () {
            moxios.uninstall();
        });

        it('should pass parameters, request and successful response', function(done) {
            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters
            );

            request.then((response: AxiosResponse) => {
                expect(response.data).toEqual(updateGroupItemMocks.response);
                expect(response.status).toBe(updateGroupItemMocks.expectedCode);
                expect(response.config.method).toBe(updateGroupItemMeta.method.toLowerCase());
                expect(response.request.url).toBe(updateGroupItemMocks.expectedUrl);
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

            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters,
                { axiosInstance }
            );

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

            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters
            );

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

            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters,
                {
                    axiosRequestConfig: {
                        cancelToken: cancelToken.token
                    }
                }
            );

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
            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.wrongParameters as any
            );

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
            const request = updateGroupItem(
                updateGroupItemMocks.wrongRequest as any,
                updateGroupItemMocks.parameters
            );

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
            const headers = { 'Content-Type': updateGroupItemMocks.wrongContentType };
            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters,
                {
                    axiosRequestConfig: { headers }
                }
            );

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiUnexpectedContentTypeError) => {
                expect(error).toBeInstanceOf(ApiUnexpectedContentTypeError);
                expect(error.contentType).toBe(updateGroupItemMocks.wrongContentType);
                expect(error.expected).toContain(updateGroupItemMocks.contentType);
                expect(error.scope).toBe(ApiValidationScopes.Request);
                done();
            });
        });
    });

    describe('incorrect or error response scenarios', () => {
        const moxiosUrlReg = getRegFromPath(updateGroupItemMeta.pathTemplate);

        beforeEach(function () {
            moxios.install();
        });

        afterEach(function () {
            moxios.uninstall();
        });

        it('should throw error when response Content-Type is wrong', function(done) {
            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters
            );

            moxios.stubRequest(moxiosUrlReg, {
                status: updateGroupItemMocks.expectedCode,
                response: {...updateGroupItemMocks.response},
                headers: {
                    'Content-Type': updateGroupItemMocks.wrongContentType
                }
            });

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiUnexpectedContentTypeError) => {
                expect(error).toBeInstanceOf(ApiUnexpectedContentTypeError);
                expect(error.contentType).toBe(updateGroupItemMocks.wrongContentType);
                expect(error.expected).toContain(updateGroupItemMocks.contentType);
                expect(error.scope).toBe(ApiValidationScopes.Response);
                done();
            });
        });

        it('should throw error when response status is wrong', function(done) {
            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters
            );

            moxios.stubRequest(moxiosUrlReg, {
                status: updateGroupItemMocks.wrongCode,
                response: {...updateGroupItemMocks.response}
            });

            request.then(() => {
                fail('There no successful response expected!');
                done();
            }).catch((error: ApiUnexpectedStatusCodeError) => {
                expect(error).toBeInstanceOf(ApiUnexpectedStatusCodeError);
                expect(error.statusCode).toBe(String(updateGroupItemMocks.wrongCode));
                expect(error.expected).toContain(String(updateGroupItemMocks.expectedCode));
                done();

            });
        });

        it('should throw error when response is wrong', function(done) {
            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters
            );

            moxios.stubRequest(moxiosUrlReg, {
                status: updateGroupItemMocks.expectedCode,
                response: {...updateGroupItemMocks.wrongResponse},
                headers: {
                    'Content-Type': updateGroupItemMocks.contentType
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
            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters
            );

            moxios.stubRequest(moxiosUrlReg, {
                status: updateGroupItemMocks.expectedErrorCode,
                response: {...updateGroupItemMocks.errorResponse},
                headers: {
                    'Content-Type': updateGroupItemMocks.contentType
                }
            });

            request.then((response) => {
                done();
            }).catch(error => {
                fail(error);
                done();
            });
        });
    });
});

/**
 * Prepares `RegExp` for `moxios` from OAS-path
 *
 * @param pathTemplate
 * @return {RegExp}
 */
function getRegFromPath(pathTemplate: string): RegExp {
    return RegExp(pathTemplate.replace(/\{[^{}]+\}/g, '.*'));
}
