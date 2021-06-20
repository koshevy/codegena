import { EventEmitter, Injectable } from '@angular/core';
import { Schema } from '@codegena/definitions/json-schema';
import * as Ajv from 'ajv';
import { ValidationError } from './validation-error';

type SchemaWithId = Schema & {$id?: string};
type AjvCompiler = Ajv.Ajv;

@Injectable()
export class AjvWrapperService {
    protected ajvs: WeakMap<object, AjvCompiler> = new WeakMap();
    protected validators: Record<string, any> = {};

    constructor(
        private validationErrorStream: EventEmitter<ValidationError> | null = null,
        private shouldThrowOnFails: boolean = true,
        private formats: Record<string, any> = {},
        private unknownFormats: string[] = [],
        private ajvOptions: Ajv.Options = {},
    ) {}

    /**
     * @throws ValidationError if fails and `shouldThrowOnFails` is true
     * @param value value should be validated
     * @param schema schema should be used for validation
     * @param domainSchemas Library of schemas used for that business domain
     */
    public validate(value: unknown, schema: SchemaWithId, domainSchemas: object): void {
        const validate = this.getValidator(schema, domainSchemas);

        if (validate(value)) {
            return;
        }

        const validationError = new ValidationError(
            `Validation failed, schema id: ${schema.$id}`,
            value,
            schema,
            validate.errors || null,
        );

        if (this.validationErrorStream) {
            this.validationErrorStream.emit(validationError);
        }

        if (this.shouldThrowOnFails) {
            throw validationError;
        }
    }

    private getValidator(schema: SchemaWithId, domainSchemas: object): Ajv.ValidateFunction {
        if (schema.$id && this.validators[schema.$id]) {
            return this.validators[schema.$id];
        }

        const compiler = this.getCompiler(domainSchemas);
        const validator = compiler?.compile(schema);

        if (!validator) {
            throw new Error(`Can't compile validator!`);
        }

        if (schema.$id) {
            this.validators[schema.$id] = validator;
        }

        return validator;
    }

    private getCompiler(domainSchemas: object): AjvCompiler | null {
        if (!this.ajvs.has(domainSchemas)) {
            this.ajvs.set(domainSchemas, this.createCompiler(domainSchemas));
        }

        return this.ajvs.get(domainSchemas) || null;
    }

    private createCompiler(domainSchemas: object): AjvCompiler {
        return new Ajv({
            allErrors: true,
            coerceTypes: false,
            errorDataPath: 'property',
            formats: this.formats,
            jsonPointers: false,
            ownProperties: true,
            removeAdditional: true,
            schemas: [domainSchemas],
            unknownFormats: this.unknownFormats,
            useDefaults: true,
            verbose: true,
            nullable: true,
            ...this.ajvOptions,
        });
    }
}
