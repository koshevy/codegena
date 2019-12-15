import { Schema } from './schema';

export interface SchemaNumber extends Schema {
    description?: string;
    required?: string[];
    title?: string;
    type: 'number';
    $ref?: string;
    example?: number;
    default?: number;
}
