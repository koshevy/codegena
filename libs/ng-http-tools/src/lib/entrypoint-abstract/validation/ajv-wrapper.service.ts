import { Injectable } from '@angular/core';
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
        private shouldThrowOnFails: boolean,
        private formats: Record<string, any> = {},
        private unknownFormats: string[] = [],
    ) {}

    /**
     * @throws ValidationError if fails and `shouldThrowOnFails` is true
     * @param value value should be validated
     * @param schema schema should be used for validation
     * @param domainSchema Library of schemas used for that business domain
     */
    public validate(value: unknown, schema: SchemaWithId, domainSchemas: object): void {
        const validate = this.getValidator(schema, domainSchemas);

        if (validate(value)) {
            return;
        }

        if (this.shouldThrowOnFails) {
            throw new ValidationError(
                `Validation failed, schema id: ${schema.$id}`,
                value,
                schema,
                validate.errors,
            );
        }
    }

    private getValidator(schema: SchemaWithId, domainSchemas: object) {
        if (schema.$id && this.validators[schema.$id]) {
            return this.validators[schema.$id];
        }

        const compiler = this.getCompiler(domainSchemas);
        const validator = compiler.compile(schema);

        if (schema.$id) {
            this.validators[schema.$id] = validator;
        }

        return validator;
    }

    private getCompiler(domainSchemas: object): AjvCompiler {
        if (!this.ajvs.has(domainSchemas)) {
            this.ajvs.set(domainSchemas, this.createCompiler(domainSchemas));
        }

        return this.ajvs.get(domainSchemas);
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
        });
    }
}