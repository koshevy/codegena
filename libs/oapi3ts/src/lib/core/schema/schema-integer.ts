import { Schema } from './schema';

export interface SchemaInteger extends Schema {
    description?: string;
    required?: string[];
    title?: string;
    type: 'integer';
    $ref?: string;
    example?: number;
    default?: number;
}
