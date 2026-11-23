import type { HasDependentRequired } from './has-dependent-required';

/* eslint-disable max-len */
/**
 * @see https://json-schema.org/understanding-json-schema/reference/object#additionalproperties
 */
export interface HasAdditionalProperties<TPropertySchema> {
  additionalProperties: boolean | TPropertySchema;
}

/**
 * see https://json-schema.org/understanding-json-schema/reference/object#size
 */
export interface HasObjectSize {
  maxProperties: number;
  minProperties: number;
}

/**
 * see https://json-schema.org/understanding-json-schema/reference/object#patternProperties
 */
export interface HasPatternProperties<
  TPropertySchema,
  TPropertyNames extends string,
> {
  patternProperties: Record<TPropertyNames, TPropertySchema>;
}

/**
 * see https://json-schema.org/understanding-json-schema/reference/object#properties
 */
export interface HasProperties<
  TPropertySchema,
  TPropertyNames extends string,
> {
  properties: Record<TPropertyNames, TPropertySchema>;
  required: TPropertyNames[];
}

/**
 * @deprecated in order tot {@link HasPatternProperties}
 * see https://json-schema.org/understanding-json-schema/reference/object#propertyNames
 */
export interface HasPropertyNames {
  propertyNames: {
    pattern: string;
  };
}

/**
 * see https://json-schema.org/understanding-json-schema/reference/object#unevaluatedproperties
 */
export interface HasUnevaluatedProperties {
  unevaluatedProperties: boolean;
}
/* eslint-enable max-len */

/**
 * @see https://json-schema.org/understanding-json-schema/reference/object
 */
export type HasObjectValue<
  TPropertySchema,
  TPropertyNames extends string,
> = Partial<
  & HasAdditionalProperties<TPropertySchema>
  & HasDependentRequired
  & HasObjectSize
  & HasPatternProperties<TPropertySchema, TPropertyNames>
  & HasProperties<TPropertySchema, TPropertyNames>
  & HasPropertyNames
  & HasUnevaluatedProperties
>;
