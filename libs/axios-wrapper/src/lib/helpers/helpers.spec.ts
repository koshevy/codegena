import * as generateUid from 'nanoid';

import {
    createUrl,
    getAxiosInstance,
    getBaseUrl,

    MissedNecessaryPathParamError,
    NoBaseUrlRedefineMatchesError
} from './index';

describe('Working of helpers:', () => {
    describe('`createUrl` helper', () => {
        it.each([
            [
                0, // count of unused params
                {}
            ],
            [
                1,
                {unusedParam1: 'Unused data 1'}
            ],
            [
                2,
                {unusedParam2: 'Unused data 2'},
                {unusedParam3: 'Unused data 3'}
            ],
            [
                4,
                {unusedParam4: 'Unused data 4'},
                {unusedParam5: 'Unused data 5'},
                {unusedParam6: 'Unused data 6'},
                {unusedParam7: 'Unused data 7'}
            ]
        ])('should replace in-path params and have %i unused params', (count, unusedParameters) => {
            const groupId = generateUid();
            const itemId = generateUid();
            const result = createUrl(
                '/group/{groupId}/item/{itemId}',
                {
                    ...unusedParameters,
                    groupId,
                    itemId
                }
            );

            expect(result).toEqual({
                path: `/group/${groupId}/item/${itemId}`,
                unusedParameters
            })
        });

        it('should throw error when parameters missed', () => {
            const groupId = generateUid();

            expect(() => createUrl(
                '/group/{groupId}/item/{itemId}',
                { groupId }
            )).toThrowError(MissedNecessaryPathParamError);
        });
    });

    describe('`getAxiosInstance` helper', () => {
        it('should return the same Axios instance for the same config', () => {
            const config = {
                baseURL: 'https://some-domain.com/api/',
                timeout: 1000,
                headers: {'X-Custom-Header': 'foobar'}
            };

            const firstAppealing = getAxiosInstance(config);
            const secondAppealing = getAxiosInstance(config);

            expect(firstAppealing).toBe(secondAppealing);
            // makes sure this is AxiosInstance with all specified methods
            [
                'delete',
                'get',
                'getUri',
                'head',
                'options',
                'patch',
                'post',
                'put',
                'request'
            ].forEach(
                (property) => expect(firstAppealing).toHaveProperty(property)
            );
        });

        it('should return another Axios instance for the each config', () => {
            const config = {
                baseURL: 'https://some-domain.com/api/',
                timeout: 1000,
                headers: {'X-Custom-Header': 'foobar'}
            };

            const firstAppealing = getAxiosInstance({...config});
            const secondAppealing = getAxiosInstance({...config});

            expect(firstAppealing).not.toBe(secondAppealing);
        });
    });

    describe('`getBaseUrl` helper', () => {
        const originalServerUrls = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003'
        ];

        it('should return coerced string when `redefineBaseUrl` is string', () => {
            const newBaseUrl = 'http://localhost:4201';

            expect(getBaseUrl([], newBaseUrl)).toBe(newBaseUrl);
            expect(getBaseUrl(originalServerUrls, newBaseUrl)).toBe(newBaseUrl);
        });

        it('should return correct redefined base url when `redefineBaseUrl` is map', () => {
            const newBaseUrl = 'http://localhost:4202';
            const obtainedBaseUrl = getBaseUrl(originalServerUrls, {
                [originalServerUrls[1]]: newBaseUrl
            });

            expect(obtainedBaseUrl).toBe(newBaseUrl);
        });

        it('should throw error when mapping has no matches with actual server urls', () => {
            const newBaseUrl = 'http://localhost:4202';

            // with empty "servers"
            expect(() => getBaseUrl(
                [],
                { 'http://localhost:4200': newBaseUrl }
            )).toThrowError(NoBaseUrlRedefineMatchesError);
            // with filled "servers"
            expect(() => getBaseUrl(
                originalServerUrls,
                { 'http://localhost:4200': newBaseUrl }
            )).toThrowError(NoBaseUrlRedefineMatchesError);
        });

        it('should return first server path when there are no servers', () => {
            expect(getBaseUrl(originalServerUrls, null)).toBe(originalServerUrls[0]);
            expect(getBaseUrl(originalServerUrls, undefined)).toBe(originalServerUrls[0]);
        });

        it('should return `null` when there are not redefines and servers', () => {
            expect(getBaseUrl([], null)).toBe(null);
            expect(getBaseUrl([], undefined)).toBe(null);
            expect(getBaseUrl(null, undefined)).toBe(null);
        });
    });
});
