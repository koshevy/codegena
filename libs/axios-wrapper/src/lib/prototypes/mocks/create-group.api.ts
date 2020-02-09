import * as generateUid from 'nanoid';

import {
    CreateGroupRequest,
    CreateGroupResponse
} from '../../auto-generated/typings/index'

// TODO this mock should be replaced by auto mocks generation https://github.com/koshevy/codegena/issues/9

export const body: CreateGroupRequest = {
    title: 'Sample group title',
    description: 'Sample group description in few words',
    isComplete: false
};

export const wrongBody = {
    _title: 'Sample group title',
    _description: 'Sample group description in few words',
    isComplete: 100
};

export const parameters = null;
export const wrongParameters = null;

export const response: CreateGroupResponse<201> = {
    ...body,
    dateCreated: (new Date()).toISOString(),
    dateChanged: (new Date()).toISOString(),
    uid: generateUid(),
    items: []
};

export const wrongResponse = {
    dateCreated: (new Date()).toISOString(),
    dateChanged: (new Date()).toISOString(),
    uid: 0,
    items: false
};

export const errorResponse: CreateGroupResponse<500> = {
    description: 'Server error occurred',
    message: 'Error 500'
};

export const contentType = 'application/json';
export const wrongContentType = 'application/x-www-form-urlencoded';

export const expectedUrl = `/group`;
export const expectedCode = 201;
export const expectedErrorCode = 500;
export const wrongCode = 301;
