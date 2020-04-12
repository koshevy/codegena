import _ from 'lodash';

import { BehaviorSubject, Subject } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { async, fakeAsync, TestBed } from '@angular/core/testing';
import { ApiModule } from './api.module';
import { ApiService, RequestMetadataResponse } from './api.service';

import {
    ApiErrorHandler,
    ValidationError,
    DISABLE_VALIDATION,
    RESET_API_SUBSCRIBERS,
    VIRTUAL_CONNECTION_STATUS,
} from './providers/event-manager.provider';

import {
    API_ERROR_PROVIDERS,
    TESTING_PROVIDERS,
    URL_REPLACE_PROVIDERS,
    apiServices
} from './testing.providers';
import { MockRequestData } from './mocks/request.data';
import {
    HttpClientTestingModule,
    HttpTestingController, TestRequest
} from '@angular/common/http/testing';

import * as requestData from './mocks/request.data';

import { RequestSender } from './providers/request-sender';
import { ServersInfo, SERVERS_INFO } from './providers/servers.info.provider';

describe('Correct working of subclasses of `ApiService` in `@codegena/ng-api-service`', () => {
    describe('common requests', () => {
        let httpTestingController: HttpTestingController;

        // Provide auto-generated services into module
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [],
                imports: [
                    ApiModule,
                    HttpClientTestingModule
                ],
                providers: [
                    ...TESTING_PROVIDERS
                ]
            }).compileComponents();

            httpTestingController = TestBed.inject(HttpTestingController);
        }));

        // Check the API-services injected successfully
        // and module can provide access to every of these
        it('should be successfully injected', () => {
            eachApiService((serviceInstance) => {
                expect(serviceInstance instanceof ApiService).toBeTruthy();
            });
        });

        // request with correct data
        it('should do successful request', fakeAsync(() => {
            // iterate api-services
            // todo migrate for https://jestjs.io/docs/en/api.html#1-testeachtablename-fn-timeout
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    (response: HttpResponse<any>) => {
                        expect(response instanceof HttpResponse).toBeTruthy();
                        expect(response.body).toBe(requestMock.response);
                    },
                    err => fail(err)
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                expect(testRequest.request.url).toMatch(/^http:\/\/localhost/);
                // send mock answer to subscriber of request
                testRequest.flush(requestMock.response);
            });
        }));

        // request with wrong request (body)
        it('should throw error when request is wrong', fakeAsync(() => {
            // iterate api-services
            // todo migrate to https://jestjs.io/docs/en/api#describeskipeachtablename-fn-1
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                let errorThrown;

                // do testing request
                serviceInstance.request(
                    requestMock.wrongRequest,
                    requestMock.params,
                    {},
                    null
                ).subscribe(
                    (response) => fail(new Error(
                      'Request should not be accomplished due request validation error'
                    )),
                    (err: ValidationError) => {
                        // counting every expected error for further check
                        errorThrown = true;

                        expect(err instanceof ValidationError).toBeTruthy();
                        expect(err.sender).toBe(serviceInstance);
                        expect(err.value).toBe(requestMock.wrongRequest);
                        expect(err.type).toBe('request');
                    }
                );

                expect(errorThrown).toBeTruthy();
            });
        }));

        // request with wrong params
        it('should throw error when params are wrong', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                let errorThrown;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.wrongParams,
                    {},
                    null
                ).subscribe(
                    (response) => fail(new Error(
                      'Request should not be accomplished due params validation error'
                    )),
                    (err: ValidationError) => {
                        // counting every expected error for further check
                        errorThrown = true;

                        expect(err instanceof ValidationError).toBeTruthy();
                        expect(err.sender).toBe(serviceInstance);
                        expect(err.value).toBe(requestMock.wrongParams);
                        expect(err.type).toBe('params');
                    }
                );

                expect(errorThrown).toBeTruthy();
            });
        }));

        // request with wrong responses
        it('should throw error when response is wrong', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let errorThrown: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    // expect(response).toBe(requestMock.response);
                    (response) => fail(new Error(
                        'Request should not be accomplished due response validation error'
                    )),
                    (err: ValidationError) => {
                        // counting every expected error for further check
                        errorThrown = true;

                        expect(err instanceof ValidationError).toBeTruthy();
                        expect(err.sender).toBe(serviceInstance);
                        expect(err.value).toBe(requestMock.wrongResponse);
                        expect(err.type).toBe('response');
                    }
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                // send mock answer to subscriber of request (with wrong response)
                testRequest.flush(requestMock.wrongResponse);

                expect(errorThrown).toBeTruthy();
            });
        }));

        // request with correct error responses (500)
        it('should get correct error response (500)', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let errorThrown: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    (response) => fail('Expected error response'),
                    (err: HttpErrorResponse) => {
                        // counting every expected error for further check
                        errorThrown = true;

                        expect(err instanceof HttpErrorResponse).toBe(true);
                        expect(err.error).toBe(requestMock.errorResponse);
                    }
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                // send mock answer to subscriber of request (with wrong response)
                testRequest.flush(requestMock.errorResponse, {
                    status: 500,
                    statusText: 'Fake server error'
                });

                expect(errorThrown).toBeTruthy();
            });
        }));

        // request with wrong error responses (500)
        it('should throw error when error response (500) is wrong', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let errorThrown: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    (response) => fail('Expected error response'),
                    (err: ValidationError) => {
                        // counting every expected error for further check
                        errorThrown = true;

                        expect(err instanceof ValidationError).toBe(true);
                        expect(err.sender).toBe(serviceInstance);
                        expect(err.value).toBe(requestMock.wrongResponse);
                        expect(err.type).toBe('response');
                    }
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                // send mock answer to subscriber of request (with wrong response)
                testRequest.flush(requestMock.wrongResponse, {
                    status: 500,
                    statusText: 'Fake server error'
                });

                expect(errorThrown).toBeTruthy();
            });
        }));
    });

    describe('requests with error handling', () => {

        let httpTestingController: HttpTestingController;
        let resetApiSubscribers$: Subject<void>;
        let virtualConnectionStatus$: BehaviorSubject<boolean>;

        // Provide auto-generated services into module
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [],
                imports: [
                    ApiModule,
                    HttpClientTestingModule
                ],
                providers: [
                    ...TESTING_PROVIDERS,
                    // Provides mock error handler
                    ...API_ERROR_PROVIDERS
                ]
            }).compileComponents();

            httpTestingController = TestBed.inject(HttpTestingController);
            resetApiSubscribers$ = TestBed.inject(RESET_API_SUBSCRIBERS);
            virtualConnectionStatus$ = TestBed.inject(VIRTUAL_CONNECTION_STATUS) as any;
        }));

        // request with wrong data (wrong params, wrong body, wrong response),
        // when validation errors handling on by API_ERROR_HANDLER / ApiErrorHandler
        it('should pass over validation errors', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let gotResponse: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.wrongRequest,
                    requestMock.wrongResponse,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    (response: HttpResponse<any>) => {
                        expect(response instanceof HttpResponse).toBeTruthy();
                        expect(response.body).toBe(requestMock.wrongResponse);
                        gotResponse = true;
                    },
                    (err: ValidationError) => {
                        console.error(err);
                        fail(new Error('Should not throw error when validation falls!'));
                    }
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                // send mock answer to subscriber of request (with wrong response)
                testRequest.flush(requestMock.wrongResponse);
                // It seems, subscriber did\'t get a success answer
                expect(gotResponse).toBeTruthy();
            });
        }));

        /**
         * HttpErrors might be handled by {@link ApiErrorHandler}.
         * Request with error might be resended by {@link RequestSender.requestAttempt},
         * but there is only 10 attempts to repeat (by default). And 10's attempt
         * throws error.
         */
        it('should handle HTTP error 9 times and then throw error', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let expectedErrorThrown: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    (response) => fail('Expected error response'),
                    (err: HttpErrorResponse) => {
                        expect(expectedErrorThrown).toBeFalsy();
                        expect(err instanceof HttpErrorResponse).toBe(true);

                        // Only 10's attempts should throw error:
                        // when all attempts gone
                        expect(err.statusText).toBe('Fake server error #10');
                        expect(err.status).toBe(500);
                        expect(err.error).toBe(requestMock.wrongResponse);

                        expectedErrorThrown = true;
                    }
                );

                // Do 10 attempts
                _.times(10, attempt => {
                    // find last sent request
                    const [testRequest] = httpTestingController.match({
                        method: requestMetadata.request.method,
                        url: requestMetadata.url
                    });

                    expect(testRequest).toBeTruthy();
                    // send mock answer to subscriber of request (with wrong response)
                    testRequest.flush(requestMock.wrongResponse, {
                        status: 500,
                        statusText: `Fake server error #${attempt + 1}`
                    });
                });

                // Last (10) attempt should throw error
                expect(expectedErrorThrown).toBeTruthy();
            });
        }));

        it('should handle HTTP error and replace with successful response', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let gotResponse: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    (response: HttpResponse<any>) => {
                        expect(response instanceof HttpResponse).toBeTruthy();

                        expect(response.body.status).toBe(404);
                        expect(response.body.title).toBe(
                            'Success business-level answer with insignificant error'
                        );
                        gotResponse = true;
                    },
                    (err) => fail('There is should no errors!')
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                // send mock answer to subscriber of request with 404 error
                testRequest.error(requestMock.errorResponse, {
                    status: 404,
                    statusText: 'A terrible server side error with 404 status!'
                });
                expect(gotResponse).toBeTruthy();
            });
        }));

        it('should cancel all subscribers on demand', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let gotComplete: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    () => fail('There is should be no response!'),
                    (err) => fail('There are should be no errors!'),
                    () => gotComplete = true
                );

                // Reset all API subscribers!
                resetApiSubscribers$.next();

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                // Request should be canceled and complete!
                expect(testRequest.cancelled).toBeTruthy();
                expect(gotComplete).toBeTruthy();
            });
        }));

        it('should stop virtual connection after error and continue after retry', async(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData,
                serviceClass: typeof ApiService
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let testRequest, moreTestRequests: any[];
                let successfulRequestCount = 0;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    () => successfulRequestCount++,
                    (err) => fail('There are should be no errors!')
                );

                // find last sent request
                [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();

                // Sends mock answer to subscriber of request with 502 error.
                // 502 error will be handled by error in API_ERROR_PROVIDERS (see above)
                // and stop virtual connection.
                testRequest.error(requestMock.errorResponse, {
                    status: 502,
                    statusText: 'This error will require a pause!'
                });

                // more 9 requests while virtual connection is stopped
                _.times(9, () => {
                    serviceInstance.request(
                        requestMock.request,
                        requestMock.params,
                        {},
                        null,
                        requestMetadata
                    ).subscribe(
                        () => successfulRequestCount++,
                        (err) => fail('There are should be no errors!')
                    );
                });

                // find last sent requests (should not be found while virtual
                // connection is stopped)
                [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                // 'Requests should not be sent while virtual connection is stopped'
                expect(testRequest).toBeFalsy();

                // restore connection after breaking in error handler
                virtualConnectionStatus$.next(true);

                // flush results for all active requests
                setTimeout(() => {
                    // find last sent request after virtual connection on
                    moreTestRequests = httpTestingController.match({
                        method: requestMetadata.request.method,
                        url: requestMetadata.url
                    });

                    _.each(moreTestRequests,
                        (request: TestRequest) => request.flush(
                            requestMock.response
                        )
                    );
                });

                setTimeout(() =>
                    expect(successfulRequestCount).toBe(10)
                );
            });
        }));
    });

    describe('requests with URL redefines', () => {

        let httpTestingController: HttpTestingController;
        let resetApiSubscribers$: Subject<void>;
        let serversInfo: ServersInfo;

        // Provide auto-generated services into module
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [],
                imports: [
                    ApiModule,
                    HttpClientTestingModule
                ],
                providers: [
                    ...TESTING_PROVIDERS,
                    ...URL_REPLACE_PROVIDERS
                ]
            }).compileComponents();

            httpTestingController = TestBed.inject(HttpTestingController);
            resetApiSubscribers$ = TestBed.inject(RESET_API_SUBSCRIBERS);
            serversInfo = TestBed.inject(SERVERS_INFO);
        }));

        it('should redefine common URL (localhost to www.some.example.url)', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let gotComplete: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    () => fail('There is should be no response!'),
                    (err) => fail('There are should be no errors!'),
                    () => gotComplete = true
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                expect(testRequest.request.url).toMatch(
                    /^http:\/\/www\.some\.example\.url/
                );

                // close subscriptions
                resetApiSubscribers$.next();
                resetApiSubscribers$.complete();
            });
        }));

        it('should redefine URL for certain service ', fakeAsync(() => {
            // iterate api-services
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData,
                serviceClass: typeof ApiService
            ) => {
                const requestMetadata: RequestMetadataResponse = {};

                /**
                 * Manual injection redefine of URL for serviceClass.
                 * @see ServersInfo.customRedefines
                 */
                serversInfo.customRedefines = [
                    {
                        serverUrl: 'http://www.some.example.url/redefine',
                        serviceClass,
                    }
                ];

                // do testing request
                serviceInstance.request(
                    requestMock.request,
                    requestMock.params,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    () => fail('There is should be no response!'),
                    (err) => fail('There are should be no errors!')
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                // Checks whether URL was redefined or not
                expect(testRequest.request.url).toMatch(
                    /^http:\/\/www\.some\.example\.url\/redefine/
                );

                // close subscriptions
                resetApiSubscribers$.next();
                resetApiSubscribers$.complete();
            });
        }));
    });

    describe('request with disabled validation', () => {

        let httpTestingController: HttpTestingController;

        // Provide auto-generated services into module
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [],
                imports: [
                    ApiModule,
                    HttpClientTestingModule
                ],
                providers: [
                    ...TESTING_PROVIDERS,
                    {
                        provide: DISABLE_VALIDATION,
                        useValue: true
                    }
                ]
            }).compileComponents();

            httpTestingController = TestBed.inject(HttpTestingController);
        }));

        // request with wrong data (wrong params, wrong body, wrong response),
        // when validation errors handling on by API_ERROR_HANDLER / ApiErrorHandler
        it('should not throw error', fakeAsync(() => {
            // iterate api-services
            // todo migrate to https://jestjs.io/docs/en/api#describeskipeachtablename-fn-1
            eachApiService((
                serviceInstance: ApiService<any, any, any>,
                requestMock: MockRequestData
            ) => {
                const requestMetadata: RequestMetadataResponse = {};
                let gotResponse: boolean;

                // do testing request
                serviceInstance.request(
                    requestMock.wrongRequest,
                    requestMock.wrongResponse,
                    {},
                    null,
                    requestMetadata
                ).subscribe(
                    (response: HttpResponse<any>) => {
                        expect(response instanceof HttpResponse).toBeTruthy();

                        expect(response.body).toBe(requestMock.wrongResponse);
                        gotResponse = true;
                    },
                    (err: ValidationError) => {
                        console.error(err);
                        fail(new Error('Should not throw error when validation falls!'));
                    }
                );

                // find last sent request
                const [testRequest] = httpTestingController.match({
                    method: requestMetadata.request.method,
                    url: requestMetadata.url
                });

                expect(testRequest).toBeTruthy();
                // send mock answer to subscriber of request (with wrong response)
                testRequest.flush(requestMock.wrongResponse);
                expect(gotResponse).toBeTruthy();
            });
        }));
    });

    // todo statusChanges tests
});

/**
 * Helper: gets list of automatic generated services,
 * gets instance of each of them and theirs mock,
 * and put into `iteratee`.
 *
 * `iteratee` will be for every service instance.
 *
 * @param iteratee
 */
function eachApiService(iteratee: (
    serviceInstance: ApiService<any, any, any>,
    requestMock: MockRequestData,
    serviceClass?: typeof ApiService
) => void) {
    _.each(apiServices as any, (service: typeof ApiService) => {
        const serviceInstance: ApiService<any, any, any> = TestBed.inject(service);
        const requestMock: MockRequestData = requestData[serviceInstance.constructor.name];

        iteratee(serviceInstance, requestMock, service);
    });
}
