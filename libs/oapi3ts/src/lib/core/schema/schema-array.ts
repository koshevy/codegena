import { Schema } from './schema';

export interface SchemaArray extends Schema {
    description?: string;
    required?: string[];
    title?: string;
    type: 'array';
    $ref?: string;
    example?: any[];
    default?: any[];

    items?: Schema;
}
