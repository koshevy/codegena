import { Schema } from './schema';

/**
 * SchemaGeneric of schema.
 * The `SchemaGeneric` has also been used in {@link DataTypeDescriptor}
 * in same way as a {@link Schema}.
 *
 * Assumed, {@link DataTypeDescriptor} with `SchemaGeneric` should be rendered as a:
 * ```
 * type SimplestGet01Response<Code extends number, ContentType extends string> =
 *   Code extends 200 ?
 *     (ContentType extends 'application/json' ? SuccessResponse : any)
 *     : Code extends 500 ?
 *     (ContentType extends 'application/json' ? SuccessResponse : any)
 *     : null;
 * ```
 */
export class SchemaGeneric {
    constructor(public children: {
        [key: string]: Schema | SchemaGeneric
    }) {}
}
