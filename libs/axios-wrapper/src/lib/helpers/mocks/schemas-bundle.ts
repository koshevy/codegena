import { ValidationSchemasBundle } from "../validate";

export const schemasBundle: ValidationSchemasBundle = {
    params: {
        properties: {
            groupId: {
                $ref: 'schema.b4c655ec1635af1be28bd6#/components/schemas/Uid'
            },
            itemId: {
                $ref: 'schema.b4c655ec1635af1be28bd6#/components/schemas/Uid'
            },
            forceSave: { type: ['boolean', 'null'], default: null }
        },
        required: ['groupId', 'itemId'],
        type: 'object'
    },
    request: {
        'application/json': {
            $ref:
                'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoTaskBlank'
        }
    },
    response: {
        '200': {
            'application/json': {
                $ref: 'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoTask'
            }
        },
        '400': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorBadRequest'
            }
        },
        '404': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorNotFound'
            }
        },
        '409': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorConflict'
            }
        },
        '500': {
            'application/json': {
                $ref:
                    'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorServer'
            }
        }
    }
};
