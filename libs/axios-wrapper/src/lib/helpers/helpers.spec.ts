import * as generateUid from 'nanoid';
import * as _ from 'lodash';

import { createUrl, NoNecessaryPathParam } from './index';

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
                url: `/group/${groupId}/item/${itemId}`,
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
});
