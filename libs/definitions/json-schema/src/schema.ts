import {
    ContainsItems,
    HasCombinedVariants,
    HasConstValue,
    HasBufferData,
    HasDefault,
    HasDescription,
    HasEnumeration,
    HasExample,
    HasId,
    HasItems,
    HasNumericValue,
    HasProperties,
    HasRef,
    HasStringValue,
} from '@codegena/definitions/aspects';

export type SchemaType =
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'array'
    | 'object'
    | 'null'
    ;

/**
 * Schema that contains only allowed `JSON Schema`-keywords in context
 * where these keywords are relevant. Also, requires to set `type` property.
 */
export type SchemaStrict =
    | SchemaUnknown
    | SchemaConcrete
    ;

/**
 * Schema can contain not only allowed `JSON Schema`-keywords,
 * unlike the {@link Schema} and the {@link SchemaStrict}.
 */
export type Schema<TExtended = Record<string, any>> = SchemaStrict & TExtended;

/**
 * Schema with no certain type, unlike the {@link SchemaConcrete}.
 * Can't contain type-specified properties (e.g. `pattern`, `minimum`, `properties`)
 *
 * Generic arguments:
 * - `TValue` — type of values in `example`, `default`, `enum` etc.
 * - `TCombinedSubSchema` — type of schema can be partially described in nested `anyOf`/`oneOf`/`allOf`
 */
export interface SchemaUnknown<
    TValue = unknown,
    TCombinedSubSchema = 'unset',
    TSchemaType extends SchemaType = SchemaType
>
    extends Partial<SchemaCommonAspect<TValue>>,
            Partial<SchemaTypedAspect<SchemaType>>,
            Partial<HasCombinedVariants<
                TCombinedSubSchema extends 'unset'
                    ? Schema
                    : TCombinedSubSchema
            >> {}

/**
 * Schema with concrete type. Should have specified `type` field,
 */
export type SchemaConcrete =
    | SchemaArray
    | SchemaBoolean
    | SchemaInteger
    | SchemaNull
    | SchemaNumber
    | SchemaObject
    | SchemaString
    ;

export type SchemaArray<TItemValue = any, TItemsSchema = SchemaUnknown & Record<string, any>> =
    & SchemaUnknown<
        TItemValue[],
        SchemaUnknown<TItemValue[], 'unset', 'array'> & SchemaArrayAspect<TItemsSchema>,
        'array'
    >
    & SchemaArrayAspect<TItemsSchema>;
export type SchemaBoolean = & SchemaUnknown<boolean, SchemaUnknown<boolean, 'unset', 'boolean'> & SchemaBooleanAspect, 'boolean'>
                            & SchemaBooleanAspect;
export type SchemaInteger = & SchemaUnknown<number, SchemaUnknown<number, 'unset', 'integer'> & SchemaIntegerAspect, 'integer'>
                            & SchemaIntegerAspect;
export type SchemaNull = & SchemaUnknown<null, SchemaUnknown<number, 'unset', 'null'> & SchemaNullAspect, 'null'>
                         & SchemaNullAspect;
export type SchemaNumber = & SchemaUnknown<number, SchemaUnknown<number, 'unset', 'number'> & SchemaNumberAspect, 'number'>
                           & SchemaNumberAspect;
export type SchemaObject<TPropertyNames extends string = string> =
                           & SchemaUnknown<object, SchemaUnknown<number, 'unset', 'object'>
                           & SchemaObjectAspect<TPropertyNames>, 'object'>
                           & SchemaObjectAspect<TPropertyNames>;

export type SchemaString = & SchemaUnknown<string, SchemaUnknown<string, 'unset', 'string'>
                           & SchemaStringAspect, 'string'>
                           & SchemaStringAspect;

interface SchemaCommonAspect<TValue = unknown>
    extends HasConstValue<TValue>,
            HasDefault<TValue>,
            HasDescription,
            HasEnumeration<TValue>,
            HasId,
            HasExample<TValue>,
            HasRef {}

interface SchemaTypedAspect<TSchemaType extends SchemaType = SchemaType> {
    type: TSchemaType;
}

type SchemaArrayAspect<TSchemaType> = & Partial<HasItems>
                                      & Partial<ContainsItems<TSchemaType>>
                                      & { type?: 'array'; };

interface SchemaBooleanAspect {
    type?: 'boolean';
}

type SchemaIntegerAspect = & Partial<HasNumericValue>
                           & { type?: 'integer'; };

interface SchemaNullAspect {
    type: 'null';
}

type SchemaNumberAspect = & Partial<HasNumericValue>
                          & { type?: 'number'; };

interface SchemaObjectAspect<TPropertyNames extends string = string>
    extends Partial<HasProperties<Schema, TPropertyNames>> {

    type?: 'object';
}

type SchemaStringAspect = & Partial<HasStringValue>
                          & Partial<HasBufferData>
                          & { type?: 'string'; };
