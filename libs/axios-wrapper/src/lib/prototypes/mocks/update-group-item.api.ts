import * as generateUid from 'nanoid';

import {
    UpdateGroupItemParameters,
    UpdateGroupItemRequest,
    UpdateGroupItemResponse
} from '../../auto-generated/typings/index'

// TODO this mock should be replaced by auto mocks generation https://github.com/koshevy/codegena/issues/9

export const request: UpdateGroupItemRequest = {
    description: 'Sample group description in few words',
    groupUid: generateUid(),
    isDone: false,
    position: 0,
    title: 'Sample group title'
};

export const parameters: UpdateGroupItemParameters = {
    groupId: generateUid(),
    itemId: generateUid(),
    forceSave: true
};

export const response: UpdateGroupItemResponse<200> = {
    ...request,
    dateCreated: (new Date()).toISOString(),
    dateChanged: (new Date()).toISOString(),
    position: 0,
    uid: generateUid()
};

export const errorResponse: UpdateGroupItemResponse<500> = {
    description: 'Server error was occur',
    message: 'Error 500'
};

export const expectedUrl = `/group/${parameters.groupId}/item/${parameters.itemId}?forceSave=true`;
export const expectedCode = 200;
export const expectedErrorCode = 500;
