import type {
  HasArrayValue,
  CanHaveAnchor,
  CanHaveCombinedVariants,
  CanHaveConstValue,
  CanHaveBufferData,
  CanHaveDefault,
  CanHaveDescription,
  CanHaveDynamicAnchor,
  CanHaveDynamicRef,
  CanHaveEnumeration,
  CanHaveExamples,
  CanHaveId,
  CanHaveNumericValue,
  HasObjectValue,
  CanHaveRef,
  HasNot,
  CanHaveValue,
} from './aspects';

export const schemaTypes = [
  'string',
  'number',
  'integer',
  'boolean',
  'array',
  'object',
  'null',
] as const;

export type SchemaType = typeof schemaTypes[number];

/**
 * Schema that contains only allowed `JSON Schema`-keywords in context
 * where these keywords are relevant. Also, requires to set `type` property.
 */
export type SchemaStrict = (
  | SchemaUnknown
  | SchemaConcrete
);

/**
 * Schema can contain not only allowed `JSON Schema`-keywords,
 * unlike the {@link Schema} and the {@link SchemaStrict}.
 */
export type Schema<TExtended = Record<string, unknown>> = SchemaStrict & TExtended;

/**
 * Schema without any concrete type, unlike the {@link SchemaConcrete}.
 * Can't contain type-specified properties (e.g. `pattern`, `minimum`, `properties`)
 *
 * Generic arguments:
 * - `TValue` — type of values in `examples`, `default`, `enum` etc.
 * - `TCombinedSubSchema` — type of schema can be partially described
 * in nested `anyOf`/`oneOf`/`allOf`
 */
export interface SchemaUnknown<
  TValue = unknown,
  TCombinedSubSchema = 'unset',
  TSchemaType extends SchemaType = SchemaType,
>
  extends SchemaCommonAspect<TValue>,
  SchemaTypedAspect<TSchemaType>,
  CanHaveCombinedVariants<
    TCombinedSubSchema extends 'unset' ? Schema : TCombinedSubSchema
  > {}

/**
 * Schema with concrete type. Should have specified `type` field,
 */
export type SchemaConcrete = (
  | SchemaArray
  | SchemaBoolean
  | SchemaInteger
  | SchemaNull
  | SchemaNumber
  | SchemaObject
  | SchemaString
);

export type SchemaArray<
  TItemValue = unknown,
  TItemsSchema = SchemaUnknown & Record<string, unknown>,
> = (
  & SchemaUnknown<
    TItemValue[],
    SchemaUnknown<TItemValue[], 'unset', 'array'> & SchemaArrayAspect<TItemsSchema>,
    'array'
  >
  & SchemaArrayAspect<TItemsSchema>
);

export type SchemaBoolean = (
  & SchemaUnknown<boolean, SchemaUnknown<boolean, 'unset', 'boolean'>
  & SchemaBooleanAspect, 'boolean'>
  & SchemaBooleanAspect
);

export type SchemaInteger = (
  & SchemaUnknown<number, SchemaUnknown<number, 'unset', 'integer'>
  & SchemaIntegerAspect, 'integer'>
  & SchemaIntegerAspect
);

export type SchemaNull = (
  & SchemaUnknown<null, SchemaUnknown<null, 'unset', 'null'>
  & SchemaNullAspect, 'null'>
  & SchemaNullAspect
);

export type SchemaNumber = (
  & SchemaUnknown<number, SchemaUnknown<number, 'unset', 'number'>
  & SchemaNumberAspect, 'number'>
  & SchemaNumberAspect
);

export type SchemaObject<TPropertyNames extends string = string> = (
  & SchemaUnknown<
    object,
    & SchemaUnknown<number, 'unset', 'object'>
    & SchemaObjectAspect<TPropertyNames>,
    'object'
  >
  & SchemaObjectAspect<TPropertyNames>
);

export type SchemaString = (
  & SchemaUnknown<string, SchemaUnknown<string, 'unset', 'string'>
  & SchemaStringAspect, 'string'>
  & SchemaStringAspect
);

interface SchemaCommonAspect<TValue = unknown>
  extends CanHaveConstValue<TValue>,
  CanHaveAnchor,
  CanHaveDefault<TValue>,
  CanHaveDescription,
  CanHaveDynamicAnchor,
  CanHaveEnumeration<TValue>,
  CanHaveExamples<TValue>,
  CanHaveId,
  CanHaveDynamicRef,
  CanHaveRef,
  Partial<HasNot<Schema | boolean>> {}

interface SchemaTypedAspect<
  TSchemaType extends SchemaType = SchemaType,
> {
  type?: TSchemaType;
}

type SchemaArrayAspect<TItemSchema> = (
  & HasArrayValue<TItemSchema>
  & { type?: 'array' }
);

interface SchemaBooleanAspect {
  type?: 'boolean';
}

type SchemaIntegerAspect = (
  & CanHaveNumericValue
  & { type?: 'integer' }
);

interface SchemaNullAspect {
  type: 'null';
}

type SchemaNumberAspect = (
  & CanHaveNumericValue
  & { type?: 'number' }
);

interface SchemaObjectAspect<
  TPropertyNames extends string = string,
> extends HasObjectValue<Schema, TPropertyNames> {

  type?: 'object';
}

type SchemaStringAspect = (
  & CanHaveValue
  & CanHaveBufferData
  & { type?: 'string' }
);

export type VariativeSchema = (
  & Omit<SchemaArrayAspect<unknown>, 'type'>
  & Omit<SchemaBoolean, 'type'>
  & Omit<SchemaInteger, 'type'>
  & Omit<SchemaNull, 'type'>
  & Omit<SchemaNumber, 'type'>
  & Omit<SchemaObject, 'type'>
  & Omit<SchemaString, 'type'>
) & {
  type: SchemaType[];
};
