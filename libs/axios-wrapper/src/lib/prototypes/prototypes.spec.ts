import axios, { AxiosResponse } from 'axios';
import * as moxios from 'moxios';

import { getAxiosInstance } from '../helpers/index';

// Designed axios-wrapper prototypes and their meta
import updateGroupItem,
  * as updateGroupItemMeta from './update-group-item.api';

// Auto-generated typings, used with axios-wrappers
import * as updateGroupItemMocks from './mocks/update-group-item.api';

describe('Working of axios wrapper prototypes', () => {
    describe('wrapper for PATCH with request, parameters and response', () => {

        const moxiosUrlReg = getRegFromPath(updateGroupItemMeta.pathTemplate);

        beforeEach(function () {
            moxios.install();
            moxios.stubRequest(moxiosUrlReg, {
                status: updateGroupItemMocks.expectedCode,
                response: {...updateGroupItemMocks.response}
            });
        });

        afterEach(function () {
            moxios.uninstall();
        });

        it('should use parameters, request and return successful response', function(done) {
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
