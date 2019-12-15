import { Schema } from './schema';

export interface SchemaBoolean extends Schema {
    description?: string;
    required?: string[];
    title?: string;
    type: 'boolean';
    $ref?: string;
    example?: boolean;
    default?: boolean;
}
