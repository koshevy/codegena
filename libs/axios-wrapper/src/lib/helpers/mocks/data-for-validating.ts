import * as generateUid from 'nanoid';

export const request = {
    description: 'Sample group description in few words',
    groupUid: generateUid(),
    isDone: false,
    position: 0,
    title: 'Sample group title'
};

export const wrongRequest = {
    _description: 'Sample group description in few words',
    group_uid: generateUid(),
    is_done: false,
    _position: 0,
    _title: 'Sample group title'
};

export const parameters = {
    groupId: generateUid(),
    itemId: generateUid(),
    forceSave: true
};

export const wrongParameters = {
    group_id: generateUid(),
    item_id: generateUid(),
    force_save: true
};

export const response = {
    ...request,
    dateCreated: (new Date()).toISOString(),
    dateChanged: (new Date()).toISOString(),
    position: 0,
    uid: generateUid()
};

export const errorResponse = {
    description: 'Server error was occur',
    message: 'Error 500'
};

export const contentType = 'application/json';
export const wrongContentType = 'application/x-www-form-urlencoded';
