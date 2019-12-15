import _ from 'lodash';

import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { async, fakeAsync, TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest
} from '@angular/common/http/testing';

import { ApiModule } from './api.module';
import { TESTING_PROVIDERS } from './testing.providers';
import {
    pickResponseBody,
    tapResponse,
    UnexpectedResponse
} from './helpers';

import { RequestMetadataResponse } from './api.service';
import {
    FindPetsService as mockFindPetsService,
    MockRequestData
} from './mocks/request.data';

import { FindPetsService } from '../auto-generated';
import { FindPetsResponse } from './mocks/typings';

describe('Testing helpers', () => {
    const requestMetadata: RequestMetadataResponse = {};
    let httpTestingController: HttpTestingController;
    let apiService: FindPetsService;

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

        httpTestingController = TestBed.get(HttpTestingController);
        apiService = TestBed.get(FindPetsService);
    }));

    it('test of the `tapResponse` custom RxJS operator', fakeAsync(() => {
        const gotTapResponse = [];
        let gotNext, gotCompleted;

        apiService.request(
            mockFindPetsService.request,
            mockFindPetsService.params,
            {},
            null,
            requestMetadata
        ).pipe(
            /**
             * IT'S HERE: testing handling of response
             */
            tapResponse<FindPetsResponse>((response) => {
                expect(response).toBe(mockFindPetsService.response);
                gotTapResponse.push('any');
            }),
            tapResponse<FindPetsResponse>(
                200,
                (response) => {
                    expect(response).toBe(mockFindPetsService.response);
                    gotTapResponse.push(200);
            }),
            tapResponse<FindPetsResponse>(
                204,
                (response) => fail('Response 204 was not sent!')
            ),
            tapResponse<FindPetsResponse>(
                200,
                'text/plain',
                (response) => fail('Response 200, text/plain was not sent!')
            ),
            tapResponse<FindPetsResponse>(
                [200, 201, 204],
                ['application/json', 'application/x-json'],
                (response) => {
                    expect(response).toBe(mockFindPetsService.response);
                    gotTapResponse.push('200, application/json');
                }
            )
        ).subscribe(
            (result: HttpResponse<FindPetsResponse>) => {
                expect(result instanceof HttpResponse).toBeTruthy();

                gotNext = true;
            },
            error => fail(error),
            () => gotCompleted = true
        );

        // find last sent request
        const [testRequest] = httpTestingController.match({
            method: requestMetadata.request.method,
            url: requestMetadata.url
        });

        expect(testRequest).toBeTruthy();

        // send mock answer to subscriber of request
        testRequest.flush(mockFindPetsService.response, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        });

        expect(gotNext).toBeTruthy();
        expect(gotCompleted).toBeTruthy();
        expect(gotTapResponse).toEqual(['any', 200, '200, application/json']);
    }));

    it('test of the `pickResponseBody` custom RxJS operator', fakeAsync(() => {
        const gotNext = [],
              gotCompleted = [],
              gotErrors = [];

        /**
         * Request 1
         */
        apiService.request(
            mockFindPetsService.request,
            mockFindPetsService.params,
            {},
            null,
            requestMetadata
        ).pipe(
            pickResponseBody<FindPetsResponse>(200)
        ).subscribe(
            (response: HttpResponse<FindPetsResponse>) => {
                gotNext.push(200);
                expect(response).toBe(mockFindPetsService.response);
            },
            error => fail(error),
            () => gotCompleted.push(200)
        );

        /**
         * Request 2
         */
        apiService.request(
            mockFindPetsService.request,
            mockFindPetsService.params,
            {},
            null,
            requestMetadata
        ).pipe(
            pickResponseBody<FindPetsResponse>(204)
        ).subscribe(
            (response: HttpResponse<FindPetsResponse>) => fail(
                'Not expected reponse with code 204!'
            ),
            error => fail(error),
            () => gotCompleted.push(204)
        );

        /**
         * Request 3
         */
        apiService.request(
            mockFindPetsService.request,
            mockFindPetsService.params,
            {},
            null,
            requestMetadata
        ).pipe(
            pickResponseBody<FindPetsResponse>(
                204,
                null,
                true
            )
        ).subscribe(
            (response: HttpResponse<FindPetsResponse>) => fail(
                'Not expected reponse with code 204!'
            ),
            (error: UnexpectedResponse) => {
                expect(error.response instanceof HttpResponse).toBeTruthy();
                gotErrors.push('204 with error');
            },
            () => gotCompleted.push('204 with error')
        );

        /**
         * Request 4
         */
        apiService.request(
            mockFindPetsService.request,
            mockFindPetsService.params,
            {},
            null,
            requestMetadata
        ).pipe(
            pickResponseBody<FindPetsResponse>(
                [200, 202, 204],
                ['application/json', 'application/x-json']
            )
        ).subscribe(
            (response: HttpResponse<FindPetsResponse>) => {
                gotNext.push(`200, 202, 204 / application/json, application/x-json`);
                expect(response).toBe(mockFindPetsService.response);
            },
            error => fail(error),
            () => gotCompleted.push(
                `200, 202, 204 / application/json, application/x-json`
            )
        );

        // find last sent request
        const testRequests = httpTestingController.match({
            method: requestMetadata.request.method,
            url: requestMetadata.url
        });

        _.each(testRequests, testRequest => {
            // send mock answer to subscriber of request
            testRequest.flush(mockFindPetsService.response, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            });
        });

        expect(gotCompleted).toEqual(
            [200, 204, '200, 202, 204 / application/json, application/x-json']
        );
        expect(gotErrors).toEqual(
            ['204 with error']
        );
        expect(gotNext).toEqual(
            [200, '200, 202, 204 / application/json, application/x-json']
        );
    }));
});
