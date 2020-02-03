import { AxiosResponse } from 'axios';
import * as moxios from 'moxios';

// Designed axios-wrapper prototypes and their meta
import updateGroupItem,
  * as updateGroupItemMeta from './update-group-item.api';

// Auto-generated typings, used with axios-wrappers
import * as updateGroupItemMocks from './mocks/update-group-item';

describe('Working of axios wrapper prototypes', () => {
    describe('wrapper for PATCH with request, parameters and response', () => {

        beforeEach(function () {
            moxios.install();
        });

        afterEach(function () {
            moxios.uninstall();
        });

        it('should return successful response', function(done) {
            const moxiosUrlReg = getRegFromPath(updateGroupItemMeta.pathTemplate);
            const request = updateGroupItem(
                updateGroupItemMocks.request,
                updateGroupItemMocks.parameters
            );

            // Match against an exact URL value
            moxios.stubRequest(moxiosUrlReg, {
                status: updateGroupItemMocks.expectedCode,
                response: {...updateGroupItemMocks.response}
            });

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
