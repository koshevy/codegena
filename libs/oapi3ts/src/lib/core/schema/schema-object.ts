import { Schema } from './schema';

export interface SchemaObject extends Schema {
    default?: {[key: string]: any};
    description?: string;
    example?: {[key: string]: any};
    required?: string[];
    title?: string;
    type: 'object';
    $ref?: string;

    additionalProperties?: Schema | boolean;
    properties?: {[key: string]: Schema};
}
