import * as generateUid from 'nanoid';
import * as _ from 'lodash';

import {
    createUrl,
    getAxiosInstance,
    NoNecessaryPathParam
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
            )).toThrowError(NoNecessaryPathParam);
        });
    });

    describe('`getAxiosInstance` helper', () => {
        it('should get the same Axios instance for the same config', () => {
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

        it('should get another Axios instance for the each config', () => {
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
});
