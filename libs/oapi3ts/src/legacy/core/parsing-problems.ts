import {
    Generic as SchemaGeneric,
    Schema,
} from '@codegena/definitions/json-schema';
import { Oas3Specification } from '@codegena/definitions/oas3';
import {
    DataTypeDescriptor,
    DescriptorContext
} from './data-type-descriptor';

export interface ParsingProblemMeta {
    context?: DescriptorContext,
    descriptors?: DataTypeDescriptor | DataTypeDescriptor[],
    oasStructure?: Oas3Specification,
    schema?: Schema | SchemaGeneric,
    /**
     * Path of place in {@link oasStructure} was in parsing when the error occurred.
     * Using format [RFC-6901](https://tools.ietf.org/html/rfc6901).
     */
    jsonPath?: string,
    /**
     * JSON Schema `$ref` was trying to parse or related with parsed descriptor
     * in moment when error occurred.
     */
    relatedRef?: string,
    originalError?: any
}

export class ParsingProblems {
    public static throwErrorOnWarning = false;
    public static onWarnings: (
        message: string,
        meta?: ParsingProblemMeta
    ) => void;

    public static parsingWarning(
        message: string,
        meta?: ParsingProblemMeta
    ): void {
        if (this.throwErrorOnWarning) {
            throw new ParsingError(message, meta);
        }

        if (this.onWarnings) {
            this.onWarnings(message, meta);
        }

        console.warn(
            `WARNING: ${message}\n${
                (meta && meta.jsonPath)
                    ? `JSON Path of problem place: ${meta.jsonPath}`
                    : 'No json path attached.'
            }`
        );
    }
}

export class ParsingError implements Error {
    public readonly stack: string;
    public readonly name = 'OAS3 Parsing Error';

    constructor(
        public readonly message: string,
        public readonly meta?: ParsingProblemMeta
    ) {}
}
