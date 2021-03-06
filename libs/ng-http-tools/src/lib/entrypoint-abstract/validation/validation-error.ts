import { Schema } from '@codegena/definitions/json-schema';
import {
    ValidationError as AjvValidationError,
    ErrorObject as AjvErrorObject,
} from 'ajv';

export class ValidationError {
    constructor(
        public readonly message: string,
        public readonly value: unknown,
        public readonly schema: Schema,
        public readonly errors: (AjvValidationError | AjvErrorObject)[] | null,
    ) {}
}
