import * as generateUid from 'nanoid';

import {
    GetGroupsParameters,
    GetGroupsResponse
} from '../../auto-generated/typings/index'

// TODO this mock should be replaced by auto mocks generation https://github.com/koshevy/codegena/issues/9

export const body = null;
export const wrongBody = null;

export const parameters: GetGroupsParameters = {
    isComplete: true,
    withItems: false
};

export const wrongParameters = {
    isComplete: 'true',
    with_items: false
};

export const response: GetGroupsResponse<200> = [
    {
        uid: generateUid(),
        title: 'Group title in few words',
        description: 'Group description in few words',
        items: [],
        isComplete: true,
        dateCreated: (new Date()).toISOString(),
        dateChanged: (new Date()).toISOString()
    }
];

export const wrongResponse = {
    uid: generateUid(),
    title: '',
    description: '',
    items: [],
    isComplete: true,
    dateCreated: (new Date()).toISOString(),
    dateChanged: (new Date()).toISOString()
};

export const errorResponse: GetGroupsResponse<500> = {
    description: 'Server error occurred',
    message: 'Error 500'
};

export const contentType = 'application/json';
export const wrongContentType = 'application/x-www-form-urlencoded';

export const expectedUrl = `/group?isComplete=true&withItems=false`;
export const expectedCode = 200;
export const expectedErrorCode = 500;
export const wrongCode = 301;
