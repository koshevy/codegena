import { Schema } from './schema';

export interface SchemaString extends Schema {
    description?: string;
    required?: string[];
    title?: string;
    type: 'string';
    $ref?: string;
    default?: string;
}
