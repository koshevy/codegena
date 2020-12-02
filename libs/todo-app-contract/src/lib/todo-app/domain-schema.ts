export const domainSchema = {
    $id: 'todo-app',
    components: {
        parameters: {
            forceSave: {
                name: 'forceSave',
                in: 'query',
                description: 'Force save group despite conflicts',
                required: false,
                schema: {
                    type: ['boolean', 'null'],
                    default: null,
                },
            },
            itemId: {
                name: 'itemId',
                in: 'path',
                description: 'Uid of TODO group item',
                required: true,
                schema: {
                    $ref: '#/components/schemas/Uid',
                },
            },
            isComplete: {
                name: 'isComplete',
                in: 'query',
                description: 'Filter groups by `complete` status',
                required: false,
                schema: {
                    type: 'boolean',
                },
            },
            groupId: {
                name: 'groupId',
                in: 'path',
                description: 'Uid of TODO group',
                required: true,
                schema: {
                    $ref: '#/components/schemas/Uid',
                },
            },
            withItems: {
                name: 'withItems',
                in: 'query',
                description:
                    "Set it `true` if you want to get all group items with group. Always returns empty `items` array when it's `false`.",
                required: false,
                schema: {
                    type: 'boolean',
                },
            },
        },
        responses: {
            errorBadRequest: {
                description: 'Bad request',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/HttpErrorBadRequest',
                        },
                    },
                },
            },
            errorConflict: {
                description: 'Conflict',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/HttpErrorConflict',
                        },
                    },
                },
            },
            errorGroupItemNotFound: {
                description: 'Group item not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/HttpErrorNotFound',
                        },
                    },
                },
            },
            errorGroupNotFound: {
                description: 'Group not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/HttpErrorNotFound',
                        },
                    },
                },
            },
            errorServer: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/HttpErrorServer',
                        },
                    },
                },
            },
            todoTaskSaved: {
                description: 'Todos item saved',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ToDoTask',
                        },
                    },
                },
            },
            todoGroupSaved: {
                description: 'Todo group saved',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ToDoGroup',
                        },
                    },
                },
            },
        },
        schemas: {
            AttachmentMeta: {
                description: 'Common meta data model of any type of attachment',
                oneOf: [
                    {
                        $ref: '#/components/schemas/AttachmentMetaImage',
                    },
                    {
                        $ref: '#/components/schemas/AttachmentMetaDocument',
                    },
                    {
                        $ref: '#/components/schemas/ExternalResource',
                    },
                ],
            },
            AttachmentMetaImage: {
                type: 'object',
                description: 'Meta data of image attached to task',
                properties: {
                    mediaId: {
                        type: 'string',
                        description:
                            'An unique id of media. Metadata with unique get from server in return of uploaded image file.',
                        pattern: '^[a-z0-9]{16}$',
                    },
                    type: {
                        type: 'string',
                        description: 'Marks attachment as an image',
                        enum: ['image'],
                    },
                    url: {
                        description: 'Url of uploaded image',
                        $ref: '#/components/schemas/Url',
                    },
                    thumbs: {
                        type: 'object',
                        description: 'Possible thumbnails of uploaded image',
                        additionalProperties: {
                            type: 'object',
                            properties: {
                                url: {
                                    description: 'Url of cached thumb',
                                    $ref: '#/components/schemas/Url',
                                },
                                imageOptions: {
                                    description: 'Information of image',
                                    $ref: '#/components/schemas/ImageOptions',
                                },
                            },
                        },
                    },
                    format: {
                        description: 'Format of uploaded image',
                        type: 'string',
                        enum: ['png', 'jpeg', 'gif', 'svg', 'tiff'],
                    },
                    imageOptions: {
                        description: 'Url of cached thumb',
                        $ref: '#/components/schemas/ImageOptions',
                    },
                },
                required: ['mediaId', 'type', 'url', 'format', 'imageOptions'],
            },
            AttachmentMetaDocument: {
                type: 'object',
                description: 'Meta data of document attached to task',
                properties: {
                    docId: {
                        type: 'string',
                        description:
                            'An unique id of document. Metadata with unique get from server in return of uploaded image file.',
                        pattern: '^[a-z0-9]{16}$',
                    },
                    type: {
                        type: 'string',
                        description: 'Marks attachment as an document',
                        enum: ['document'],
                    },
                    url: {
                        description: 'Url of uploaded document',
                        $ref: '#/components/schemas/Url',
                    },
                    format: {
                        type: 'string',
                        description: 'Format of document',
                        enum: [
                            'doc',
                            'docx',
                            'pdf',
                            'rtf',
                            'xls',
                            'xlsx',
                            'txt',
                        ],
                    },
                    size: {
                        type: 'number',
                        description: 'File size',
                        min: 0,
                        max: 8388607,
                    },
                },
                required: ['docId', 'type', 'url', 'format', 'size'],
            },
            ExternalResource: {
                description: 'Link to any external resource in attachment',
                $ref: '#/components/schemas/Url',
            },
            HttpErrorBadRequest: {
                type: 'object',
                required: ['message'],
                properties: {
                    message: {
                        type: 'string',
                    },
                    type: {
                        type: 'string',
                        enum: ['syntax', 'semantic'],
                    },
                    errors: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/JsonError',
                        },
                    },
                },
            },
            HttpErrorConflict: {
                type: 'object',
                required: ['message'],
                properties: {
                    message: {
                        type: 'string',
                    },
                },
            },
            HttpErrorNotFound: {
                type: 'object',
                required: ['message'],
                properties: {
                    message: {
                        type: 'string',
                    },
                },
            },
            HttpErrorServer: {
                type: 'object',
                required: ['message'],
                properties: {
                    description: {
                        type: 'string',
                    },
                    message: {
                        type: 'string',
                    },
                },
            },
            ImageOptions: {
                type: 'object',
                properties: {
                    width: {
                        type: 'number',
                        min: 1,
                        max: 3000,
                    },
                    height: {
                        type: 'number',
                        min: 1,
                        max: 3000,
                    },
                    size: {
                        type: 'number',
                        min: 0,
                        max: 8388607,
                    },
                },
                required: ['width', 'height', 'size'],
            },
            JsonError: {
                type: 'object',
                required: ['originalMessage', 'jsonPointer'],
                properties: {
                    originalMessage: {
                        type: 'string',
                    },
                    message: {
                        type: 'string',
                    },
                    jsonPointer: {
                        type: 'string',
                    },
                },
            },
            ToDoTaskBlank: {
                title: "Base part of data of item in todo's group",
                description: 'Data about group item needed for creation of it',
                properties: {
                    groupUid: {
                        description:
                            'An unique id of group that item belongs to',
                        $ref: '#/components/schemas/Uid',
                    },
                    title: {
                        description: 'Short brief of task to be done',
                        type: 'string',
                        minLength: 3,
                        maxLength: 64,
                    },
                    description: {
                        description:
                            'Detailed description and context of the task. Allowed using of Common Markdown.',
                        type: ['string', 'null'],
                        minLength: 10,
                        maxLength: 1024,
                    },
                    isDone: {
                        description: 'Status of task: is done or not',
                        type: 'boolean',
                        default: false,
                        example: false,
                    },
                    position: {
                        description:
                            'Position of a task in group. Allows to track changing of state of a concrete item, including changing od position.',
                        type: 'number',
                        min: 0,
                        max: 4096,
                        example: 0,
                    },
                    attachments: {
                        type: 'array',
                        description:
                            'Any material attached to the task: may be screenshots, photos, pdf- or doc- documents on something else',
                        items: {
                            $ref: '#/components/schemas/AttachmentMeta',
                        },
                        maxItems: 16,
                        example: [],
                    },
                },
                required: ['isDone', 'title'],
                example: {
                    isDone: false,
                    title: 'Book soccer field',
                    description:
                        'The complainant agreed and recruited more members to play soccer.',
                },
            },
            ToDoTask: {
                title: "Item in todo's group",
                description:
                    'Describe data structure of an item in group of tasks',
                allOf: [
                    {
                        $ref: '#/components/schemas/ToDoTaskBlank',
                    },
                    {
                        type: 'object',
                        properties: {
                            uid: {
                                description: 'An unique id of task',
                                $ref: '#/components/schemas/Uid',
                                readOnly: true,
                            },
                            dateCreated: {
                                description:
                                    'Date/time (ISO) when task was created',
                                type: 'string',
                                format: 'date-time',
                                readOnly: true,
                                example: '2019-11-17T11:20:51.555Z',
                            },
                            dateChanged: {
                                description:
                                    'Date/time (ISO) when task was changed last time',
                                type: 'string',
                                format: 'date-time',
                                readOnly: true,
                                example: '2019-11-17T11:20:51.555Z',
                            },
                            position: {
                                description:
                                    'Auto filled property from `required`',
                            },
                        },
                        required: [
                            'dateChanged',
                            'dateCreated',
                            'position',
                            'uid',
                        ],
                    },
                ],
            },
            ToDoGroupBlank: {
                title: 'Base part of data of group',
                description: 'Data needed for group creation',
                type: 'object',
                properties: {
                    title: {
                        description: 'Title of a group',
                        type: 'string',
                        minLength: 5,
                        maxLength: 32,
                        example: 'Other activities',
                    },
                    description: {
                        description:
                            'Detailed description of a group in one/two sequences.',
                        type: 'string',
                        minLength: 16,
                        maxLength: 1024,
                        example: 'Other tasks and issues with low priority',
                    },
                    items: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/ToDoTaskBlank',
                        },
                    },
                    isComplete: {
                        description: 'Whether all tasks in group are complete',
                        oneOf: [
                            {
                                type: 'boolean',
                            },
                            {
                                type: 'null',
                            },
                        ],
                        default: null,
                    },
                },
                required: ['title'],
            },
            ToDoGroupExtendedData: {
                title: 'Extended data of group',
                description:
                    'Extended data has to be obtained after first save',
                type: 'object',
                properties: {
                    uid: {
                        description: 'An unique id of task',
                        $ref: '#/components/schemas/Uid',
                    },
                    dateCreated: {
                        description: 'Date/time (ISO) when task was created',
                        type: 'string',
                        format: 'date-time',
                        example: '2019-11-17T11:20:51.555Z',
                    },
                    dateChanged: {
                        description:
                            'Date/time (ISO) when task was changed last time',
                        type: 'string',
                        format: 'date-time',
                        example: '2019-11-17T11:20:51.555Z',
                    },
                    items: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/ToDoTask',
                        },
                    },
                },
                required: ['dateChanged', 'dateCreated', 'uid', 'items'],
            },
            ToDoGroup: {
                allOf: [
                    {
                        $ref: '#/components/schemas/ToDoGroupBlank',
                    },
                    {
                        $ref: '#/components/schemas/ToDoGroupExtendedData',
                    },
                ],
            },
            Uid: {
                title: 'UID of element',
                type: 'string',
                minLength: 16,
                maxLength: 22,
                pattern: '^[\\w\\-]+$',
                example: 'hB6BjVfbe5pBrJiT0kFzu',
                description: 'An unique id of task',
                readOnly: true,
            },
            Url: {
                description: 'Link to any external resource',
                type: 'string',
                pattern:
                    '^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?',
                example: 'http://example.com',
            },
        },
    },
};
