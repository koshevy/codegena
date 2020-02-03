import {
    ApiValidationError,
    ApiUnexpectedContentTypeError,
    validateParams,
    validateRequest
} from "./validate";
import { schemasBundle } from './mocks/schemas-bundle'
import * as dataForValidating from './mocks/data-for-validating';
import { schema as externalSchema } from './mocks/external-schema';

describe('Working of validation helpers:', () => {
    describe('validation of parameters', () => {
        const {parameters, wrongParameters} = dataForValidating;

        it ('correct validation of parameters', async function(done) {
            await validateParams(schemasBundle, parameters, externalSchema);
            done();
        });

        it ('throw `ApiValidationError` when parameters are wrong', async function(done) {
            try{
                await validateParams(schemasBundle, wrongParameters, externalSchema);
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiValidationError);
                expect((error as ApiValidationError).errors.length).toBe(2);
            }

            done();
        });
    });

    describe('validation of request', () => {
        const {
            contentType,
            request,
            wrongContentType,
            wrongRequest
        } = dataForValidating;

        it('correct validation of request', async function(done) {
            await validateRequest(schemasBundle, contentType, request, externalSchema);

            done();
        });

        it('throw `ApiUnexpectedContentTypeError` when request Content-Type is invalid', async function(done) {
            try {
                await validateRequest(schemasBundle, wrongContentType, request, externalSchema);
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiUnexpectedContentTypeError);
                expect(error.contentType).toBe(wrongContentType);
            }

            done();
        });

        it ('throw `ApiValidationError` when request body is wrong', async function(done) {
            try {
                await validateRequest(schemasBundle, contentType, wrongRequest, externalSchema);
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiValidationError);
            }

            done();
        });
    });
});
