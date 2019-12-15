export interface MockRequestData {
    params: any;
    request: any;
    response: any;
    errorResponse: any;
    /**
     * Wrong params has use for tests
     * of params validation.
     */
    wrongParams: any;
    /**
     * Wrong request has use for tests
     * of request validation.
     */
    wrongRequest: any;
    /**
     * Wrong response has use for tests
     * of response validation.
     */
    wrongResponse: any;
}

/* tslint:disable */
export const FindPetsService: MockRequestData = {
    params: {
        tags: ['cat', 'dog'],
        limit: 1000
    },
    request: null,
    response: [
        {
            id: 1,
            name: 'Barsique',
            tag: 'cat'

        },
        {
            id: 2,
            name: 'Scharique',
            tag: 'dog'
        }
    ],
    errorResponse: {
        code: 1000,
        message: 'Fake server error'
    },
    wrongParams: {
        tags: {},
        limit: 'wrong value'
    },
    wrongRequest: {},
    wrongResponse: [
        {
            wrongKey: 'wrong value'
        }
    ]
};
