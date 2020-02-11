import * as Ajv from 'ajv';
import { ErrorObject, ValidateFunction } from 'ajv';
import * as _ from 'lodash';

// *** export types

export const enum ApiValidationScopes {
    Params = 'params',
    Request = 'request',
    Response = 'response'
}

export interface ValidationContentTypesSchemas {
    [contentType: string]: any | null;
}

export interface ValidationSchemasBundle {
    [ApiValidationScopes.Params]: any | null;
    [ApiValidationScopes.Request]: ValidationContentTypesSchemas | null,
    [ApiValidationScopes.Response]: {
        [statusCode: string]: ValidationContentTypesSchemas;
    } | null;
}

export class ApiUnexpectedContentTypeError extends Error {
    constructor(
        public readonly scope: ApiValidationScopes.Request | ApiValidationScopes.Response,
        public readonly contentType: string,
        public readonly expected: string[],
        public readonly responseData?: any
    ) {
        super([
            `Unexpected content type in ${scope}: "${contentType}".`,
            `But expected: "${expected.join('", "')}".`
        ].join(' '));
    }
}

export class ApiUnexpectedStatusCodeError extends Error {
    constructor(
        public readonly statusCode: string,
        public readonly expected: string[],
        public readonly responseData?: any
    ) {
        super([
            `Unexpected status code in request: "${statusCode}".`,
            `But expected: "${expected.join('", "')}".`
        ].join(' '));
    }
}

export class ApiValidationError extends Error {
    constructor(
        public readonly scope: ApiValidationScopes,
        public readonly errors: ErrorObject[],
        public readonly data: any
    ) {
        super([
            `Validation error thrown in ${scope} with messages:`,
            `${_.map(errors, error => error.message).join('\n')}`
        ].join('\n'));
    }
}

// *** private variables

const ajvCompiler = new Ajv({
    allErrors: true,
    coerceTypes: false,
    missingRefs: true,
    nullable: true,
    unknownFormats: 'ignore',
    useDefaults: true
});

type ValidationResult = ErrorObject[] | void;

/**
 * Already exists validators for different schemas.
 */
const validateFunctions = new WeakMap<object, ValidateFunction>();
const externalSchemas = new WeakSet<object>();

// *** export functions

/**
 * @param bundle
 * @param data
 * @param externalSchema
 * @throws ApiValidationError
 */
export async function validateParams(
    bundle: ValidationSchemasBundle,
    data: any,
    externalSchema: any
): Promise<void> {
    // TODO add test case when schema is null
    if(bundle.params === null) {
        return;
    }

    registerExternalSchemaIfDidnt(externalSchema);

    const validatorFn = await getAjvValidator(bundle.params);

    if (!validatorFn(data)) {
        throw new ApiValidationError(
            ApiValidationScopes.Params,
            validatorFn.errors,
            data
        );
    }
}

/**
 * @param bundle
 * @param contentType
 * @param data
 * @param externalSchema
 * @throws ApiUnexpectedContentTypeError
 * @throws ApiValidationError
 */
export async function validateRequest(
    bundle: ValidationSchemasBundle,
    contentType: string,
    data: any,
    externalSchema: any
): Promise<void> {
    // TODO add test case when schema is null
    if(bundle.request === null) {
        return;
    }

    if (!bundle.request[contentType]) {
        throw new ApiUnexpectedContentTypeError(
            ApiValidationScopes.Request,
            contentType,
            _.keys(bundle.request)
        );
    }

    registerExternalSchemaIfDidnt(externalSchema);

    const validatorFn = await getAjvValidator(bundle.request[contentType]);

    if (!validatorFn(data)) {
        throw new ApiValidationError(
            ApiValidationScopes.Request,
            validatorFn.errors,
            data
        );
    }
}

export async function validateResponse(
    bundle: ValidationSchemasBundle,
    statusCode: string,
    contentType: string,
    data: any,
    externalSchema: any,
): Promise<void> {
    // TODO add test case when schema is null
    if(bundle.response === null) {
        return;
    }

    const contentTypes = bundle.response[statusCode];

    if (!contentTypes) {
        throw new ApiUnexpectedStatusCodeError(statusCode, _.keys(bundle.response));
    }

    if (!contentTypes[contentType]) {
        throw new ApiUnexpectedContentTypeError(
            ApiValidationScopes.Response,
            contentType,
            _.keys(contentTypes)
        )
    }

    registerExternalSchemaIfDidnt(externalSchema);

    const validatorFn = await getAjvValidator(contentTypes[contentType]);

    if (!validatorFn(data)) {
        throw new ApiValidationError(
            ApiValidationScopes.Response,
            validatorFn.errors,
            data
        );
    }
}

// *** private functions

async function getAjvValidator(schema: object): Promise<ValidateFunction> {
    if (validateFunctions.has(schema)) {
        return validateFunctions.get(schema);
    } else {
        const validatorFn: ValidateFunction = ajvCompiler.compile(schema);
        validateFunctions.set(schema, validatorFn);

        return validatorFn;
    }
}

/**
 * Add `externalSchema` to ajv's scope if it did't yet.
 * @param externalSchema
 */
function registerExternalSchemaIfDidnt(externalSchema) {
    if (!externalSchemas.has(externalSchema)) {
        externalSchemas.add(externalSchema);
        ajvCompiler.addSchema(externalSchema);
    }
}
