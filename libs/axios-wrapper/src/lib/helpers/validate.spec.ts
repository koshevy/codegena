import {
    ApiUnexpectedContentTypeError, ApiUnexpectedStatusCodeError,
    ApiValidationError,
    ApiValidationScopes,
    validateParams,
    validateRequest,
    validateResponse
} from "./validate";
import { schemasBundle } from './mocks/schemas-bundle'
import * as dataForValidating from './mocks/data-for-validating';
import { schema as externalSchema } from './mocks/external-schema';

describe('Working of validation helpers:', () => {
    describe('validation of parameters', () => {
        const { parameters, wrongParameters } = dataForValidating;

        it ('should correct validate parameters', async function(done) {
            await validateParams(schemasBundle, parameters, externalSchema);
            done();
        });

        it ('should throw `ApiValidationError` when parameters are wrong', async function(done) {
            try{
                await validateParams(schemasBundle, wrongParameters, externalSchema);
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiValidationError);
                expect((error as ApiValidationError).errors.length).toBe(2);
                expect(error.scope).toBe(ApiValidationScopes.Params);
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

        it('should correct validate request', async function(done) {
            await validateRequest(schemasBundle, contentType, request, externalSchema);
            done();
        });

        it('should throw `ApiUnexpectedContentTypeError` when request Content-Type is invalid', async function(done) {
            try {
                await validateRequest(schemasBundle, wrongContentType, request, externalSchema);
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiUnexpectedContentTypeError);
                expect(error.contentType).toBe(wrongContentType);
                expect(error.scope).toBe(ApiValidationScopes.Request);
            }

            done();
        });

        it ('should throw `ApiValidationError` when request body is wrong', async function(done) {
            try {
                await validateRequest(schemasBundle, contentType, wrongRequest, externalSchema);
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiValidationError);
            }

            done();
        });
    });

    describe('validation of response', () => {
        const {
            contentType,
            errorStatusCode,
            errorResponse,
            response,
            statusCode,
            wrongContentType,
            wrongResponse,
            wrongStatusCode
        } = dataForValidating;

        it('should correct validate response', async function(done) {
            await validateResponse(schemasBundle, statusCode, contentType, response, externalSchema)
            done();
        });

        it('should correct validate server error response', async function(done) {
            await validateResponse(schemasBundle, errorStatusCode, contentType, errorResponse, externalSchema)
            done();
        });

        it('should throw `ApiUnexpectedContentTypeError` when response Content-Type is invalid', async function(done) {
            try {
                await validateResponse(schemasBundle, statusCode, wrongContentType, response, externalSchema);
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiUnexpectedContentTypeError);
                expect(error.contentType).toBe(wrongContentType);
                expect(error.scope).toBe(ApiValidationScopes.Response);
            }

            done();
        });

        it('should throw `ApiUnexpectedStatusCodeError` when response status is invalid', async function(done) {
            try {
                await validateResponse(schemasBundle, wrongStatusCode, contentType, response, externalSchema);
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiUnexpectedStatusCodeError);
                expect(error.statusCode).toBe(wrongStatusCode);
                Object.keys(schemasBundle.response).forEach(code =>
                    expect(error.expected).toContain(code)
                );
            }

            done();
        });

        it ('should throw `ApiValidationError` when request body is wrong', async function(done) {
            try {
                await validateResponse(schemasBundle, statusCode, contentType, wrongResponse, externalSchema)
                fail('There should be thrown an error!');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiValidationError);
            }

            done();
        });
    });
});
