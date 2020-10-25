import { Schema } from './schema';

/**
 * Generic of schema.
 * The `Generic` has also been used in {@link DataTypeDescriptor}
 * in same way as a {@link Schema}.
 *
 * Assumed, {@link DataTypeDescriptor} with `Generic` should be rendered as a:
 * ```
 * type SimplestGet01Response<Code extends number, ContentType extends string> =
 *   Code extends 200 ?
 *     (ContentType extends 'application/json' ? SuccessResponse : any)
 *     : Code extends 500 ?
 *     (ContentType extends 'application/json' ? SuccessResponse : any)
 *     : null;
 * ```
 */
export class Generic {
    constructor(public children: {
        [key: string]: Schema | Generic
    }) {}
}
