// fixme decompose large file
/* eslint-disable max-lines */
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

import type {
  HasAllOfVariants,
  HasAnchor,
  HasAnyOfVariants,
  CanHaveCombinedVariants,
  HasDependentRequired,
  HasDynamicAnchor,
  HasDynamicRef,
  HasIf,
  HasNot,
  HasRef,
  HasOneOfVariants,
  HasPatternProperties,
  HasPropertyNames,
} from './aspects';
import {
  schemaTypes,
  type Schema,
  type SchemaType,
  type SchemaArray,
  type SchemaBoolean,
  type SchemaInteger,
  type SchemaNull,
  type SchemaNumber,
  type SchemaObject,
  type SchemaString,
  type VariativeSchema,
} from './json-schema';

export const jsInternalTypes = [
  'string',
  'number',
  'bigint',
  'boolean',
  'symbol',
  'undefined',
  'object',
  'function',
];

export type JsInternalType = typeof jsInternalTypes[number];
export type JsInternalTypeExtended = typeof jsInternalTypes[number] | null;
export type JsInternalTypeNonDetermined = JsInternalTypeExtended | 'unknown';

export function isJsInternalType(
  possiblyType: unknown,
): possiblyType is JsInternalType {
  return (jsInternalTypes as unknown[]).includes(possiblyType);
}

export function isJsInternalTypeExtended(
  possiblyType: unknown,
): possiblyType is JsInternalTypeExtended {
  return isJsInternalType(possiblyType) || possiblyType === 'null';
}

export function isJsInternalTypeNonDetermined(
  possiblyType: unknown,
): possiblyType is JsInternalTypeNonDetermined {
  return possiblyType === 'unknown' || isJsInternalTypeExtended(possiblyType);
}

export function isHasAllOfVariants<TPrevInferredType>(
  schema: TPrevInferredType,
): schema is HasAllOfVariants & TPrevInferredType {
  return typeof schema === 'object'
    && schema !== null
    && 'allOf' in schema
    && Array.isArray((schema as HasAllOfVariants).allOf);
}

export function isHasAnyOfVariants<TPrevInferredType>(
  schema: TPrevInferredType,
): schema is HasAnyOfVariants & TPrevInferredType {
  return typeof schema === 'object'
    && schema !== null
    && 'anyOf' in schema
    && Array.isArray((schema as HasAnyOfVariants).anyOf);
}

export function isHasOneOfVariantsRequired<TPrevInferredType>(
  schema: TPrevInferredType,
): schema is HasOneOfVariants & TPrevInferredType {
  return typeof schema === 'object'
    && schema !== null
    && 'oneOf' in schema
    && Array.isArray((schema as HasOneOfVariants).oneOf);
}

export function isHasCombinedVariants<TPrevInferredType>(
  schema: TPrevInferredType,
): schema is CanHaveCombinedVariants & TPrevInferredType {
  return isHasAllOfVariants(schema)
    || isHasAnyOfVariants(schema)
    || isHasOneOfVariantsRequired(schema);
}

export function areAllCombinedVariantsSatisfyPredicate(
  schema: CanHaveCombinedVariants,
  isSatisfied: (pureParentSchema: unknown, subSchema?: unknown) => boolean,
): boolean {
  const allPossibleVariants = [
    ...(schema?.allOf ?? []),
    ...(schema?.anyOf ?? []),
    ...(schema?.oneOf ?? []),
  ];

  return allPossibleVariants.every((subSchema) => {
    if (typeof schema !== 'object' || schema === null) {
      return isSatisfied(subSchema);
    }

    const {
      allOf,
      anyOf,
      oneOf,
      ...parentSchema
    } = schema;

    return isSatisfied(parentSchema, subSchema);
  });
}

export function isSchemaType(possiblyType: unknown): possiblyType is SchemaType {
  return typeof possiblyType === 'string'
    && (schemaTypes as readonly string[]).includes(possiblyType);
}

export function isVariativeSchema(
  schema: unknown,
  neededType?: SchemaType,
): schema is VariativeSchema {
  return (
    typeof schema === 'object'
    && schema !== null
    && 'type' in schema
    && Array.isArray(schema.type)
    && schema.type.length > 0
    && schema.type.every(isSchemaType)
    && (!neededType || schema.type.includes(neededType))
  );
}

export function getCommonTypeOfArray(
  enumValue: unknown[],
): JsInternalTypeNonDetermined {
  if (!enumValue.length) {
    return 'unknown';
  }

  const firstMetType = enumValue[0] === null
    ? 'null'
    : typeof enumValue[0];

  const hasAnotherType = enumValue.some((value) => (
    typeof value !== firstMetType
  ));

  return hasAnotherType ? 'unknown' : firstMetType;
}

export function isSchemaBoolean(
  possibleSchema: unknown,
  shouldSkipCombinedVariantsCheck = false,
): possibleSchema is SchemaBoolean {
  if (typeof possibleSchema !== 'object' || !possibleSchema) {
    return false;
  }

  if (isVariativeSchema(possibleSchema, 'boolean')) {
    return true;
  }

  if ('type' in possibleSchema) {
    return possibleSchema.type === 'boolean';
  }

  if ('const' in possibleSchema) {
    return typeof possibleSchema.const === 'boolean';
  }

  if ('enum' in possibleSchema && Array.isArray(possibleSchema.enum)) {
    return getCommonTypeOfArray(possibleSchema.enum) === 'boolean';
  }

  if ('default' in possibleSchema) {
    return typeof possibleSchema.default === 'boolean';
  }

  if ('example' in possibleSchema) {
    return typeof possibleSchema.example === 'boolean';
  }

  if ('examples' in possibleSchema
    && Array.isArray(possibleSchema.examples)
  ) {
    return possibleSchema.examples.length > 0
      && possibleSchema.examples.every((example) => typeof example === 'boolean');
  }

  if (!shouldSkipCombinedVariantsCheck && isHasCombinedVariants(possibleSchema)) {
    return areAllCombinedVariantsSatisfyPredicate(
      possibleSchema,
      (pureParentSchema, subSchema) => {
        if (typeof pureParentSchema !== 'object'
          || pureParentSchema === null
          || typeof subSchema !== 'object'
          || subSchema === null
        ) {
          return false;
        }

        return isSchemaBoolean({ ...pureParentSchema, ...subSchema }, true);
      },
    );
  }

  return false;
}

export function isSchemaArray(
  possibleSchema: unknown,
  shouldSkipCombinedVariantsCheck = false,
): possibleSchema is SchemaArray {
  return isSchemaWithInferredType(
    possibleSchema,
    'array',
    Array.isArray,
    [
      'additionalItems',
      'contains',
      'items',
      'maxItems',
      'minItems',
      'prefixItems',
      'unevaluatedItems',
      'uniqueItems',
    ],
    shouldSkipCombinedVariantsCheck,
  );
}

export function isSchemaInteger(
  possibleSchema: unknown,
  shouldSkipCombinedVariantsCheck = false,
): possibleSchema is SchemaInteger {
  return isSchemaWithInferredType(
    possibleSchema,
    'integer',
    Number.isInteger,
    numericSchemaProperties,
    shouldSkipCombinedVariantsCheck,
  );
}

export function isSchemaNull(
  possibleSchema: unknown,
  shouldSkipCombinedVariantsCheck = false,
): possibleSchema is SchemaNull {
  return isSchemaWithInferredType(
    possibleSchema,
    'null',
    (value) => value === null,
    [],
    shouldSkipCombinedVariantsCheck,
  );
}

export function isSchemaNumber(
  possibleSchema: unknown,
  shouldSkipCombinedVariantsCheck = false,
): possibleSchema is SchemaNumber {
  return isSchemaWithInferredType(
    possibleSchema,
    'number',
    (value) => typeof value === 'number',
    numericSchemaProperties,
    shouldSkipCombinedVariantsCheck,
  );
}

export function isSchemaString(
  possibleSchema: unknown,
  shouldSkipCombinedVariantsCheck = false,
): possibleSchema is SchemaString {
  return isSchemaWithInferredType(
    possibleSchema,
    'string',
    (value) => typeof value === 'string',
    [
      'contentEncoding',
      'contentMediaType',
      'format',
      'maxLength',
      'minLength',
      'pattern',
    ],
    shouldSkipCombinedVariantsCheck,
  );
}

export function isHasPatternProperties(
  possibleSchema: unknown,
): possibleSchema is HasPatternProperties<object, string> {
  if (
    !(typeof possibleSchema === 'object'
      && possibleSchema !== null
      && 'patternProperties' in possibleSchema
      && typeof possibleSchema.patternProperties === 'object'
      && possibleSchema.patternProperties !== null
    )
    || !possibleSchema.patternProperties
  ) {
    return false;
  }

  const { patternProperties } = possibleSchema;
  const keys = Object.keys(patternProperties);
  const values = Object.values(patternProperties);

  return keys.every(isString) && values.every(isObject);
}

export function isHasPropertyNames(
  possibleSchema: unknown,
): possibleSchema is HasPropertyNames {
  return (typeof possibleSchema === 'object'
    && possibleSchema !== null
    && 'propertyNames' in possibleSchema
    && typeof possibleSchema.propertyNames === 'object'
    && possibleSchema.propertyNames !== null
    && 'pattern' in possibleSchema.propertyNames
    && typeof possibleSchema.propertyNames.pattern === 'string'
  );
}

export function isHasDependentRequired(
  possibleSchema: unknown,
): possibleSchema is HasDependentRequired {
  if (typeof possibleSchema !== 'object'
    || !possibleSchema
    || Array.isArray(possibleSchema)
    || !('dependentRequired' in possibleSchema)
  ) {
    return false;
  }

  const { dependentRequired } = possibleSchema;

  return typeof dependentRequired === 'object'
    && dependentRequired !== null
    && !Array.isArray(dependentRequired)
    && Object.values(dependentRequired).every((required) => (
      Array.isArray(required)
      && required.every((name) => typeof name === 'string')
    ));
}

export function isSchemaObject(
  possibleSchema: unknown,
  shouldSkipCombinedVariantsCheck = false,
): possibleSchema is SchemaObject {
  if (typeof possibleSchema !== 'object' || !possibleSchema) {
    return false;
  }

  if (isVariativeSchema(possibleSchema, 'object')) {
    return true;
  }

  if ('type' in possibleSchema) {
    return possibleSchema.type === 'object';
  }

  if (isHasDependentRequired(possibleSchema)) {
    return true;
  }

  if ('additionalProperties' in possibleSchema
    || 'patternProperties' in possibleSchema
  ) {
    return true;
  }

  if ('properties' in possibleSchema && isObject(possibleSchema)) {
    return true;
  }

  if ('required' in possibleSchema
    && Array.isArray(possibleSchema.required)
    && possibleSchema.required.every((name) => typeof name === 'string')
  ) {
    return true;
  }

  if ('propertyNames' in possibleSchema
    && typeof possibleSchema.propertyNames === 'object'
    && possibleSchema.propertyNames !== null
    && 'pattern' in possibleSchema.propertyNames
    && typeof possibleSchema.propertyNames.pattern === 'string'
  ) {
    return true;
  }

  if ('patternProperties' in possibleSchema
    && isObject(possibleSchema.patternProperties)
  ) {
    return true;
  }

  if ('const' in possibleSchema) {
    return typeof possibleSchema.const === 'object'
      && possibleSchema.const !== null;
  }

  if ('enum' in possibleSchema && Array.isArray(possibleSchema.enum)) {
    return getCommonTypeOfArray(possibleSchema.enum) === 'object';
  }

  if ('default' in possibleSchema) {
    return typeof possibleSchema.default === 'object'
      && possibleSchema.default !== null;
  }

  if ('example' in possibleSchema) {
    return typeof possibleSchema.example === 'object'
      && possibleSchema.example !== null;
  }

  if ('examples' in possibleSchema
    && Array.isArray(possibleSchema.examples)
  ) {
    return possibleSchema.examples.length > 0
      && possibleSchema.examples.every((example) => (
        typeof example === 'object' && example !== null
      ));
  }

  if (!shouldSkipCombinedVariantsCheck && isHasCombinedVariants(possibleSchema)) {
    return areAllCombinedVariantsSatisfyPredicate(
      possibleSchema,
      (pureParentSchema, subSchema) => {
        if (typeof pureParentSchema !== 'object'
          || pureParentSchema === null
          || typeof subSchema !== 'object'
          || subSchema === null
        ) {
          return false;
        }

        return isSchemaObject({ ...pureParentSchema, ...subSchema }, true);
      },
    );
  }

  return false;
}

export function isHasRef(
  possibleSchema: unknown,
): possibleSchema is HasRef {
  return (
    typeof possibleSchema === 'object'
    && possibleSchema !== null
    && '$ref' in possibleSchema
    && typeof possibleSchema.$ref === 'string'
  );
}

export function isHasDynamicRef(
  possibleSchema: unknown,
): possibleSchema is HasDynamicRef {
  return (
    typeof possibleSchema === 'object'
    && possibleSchema !== null
    && '$dynamicRef' in possibleSchema
    && typeof possibleSchema.$dynamicRef === 'string'
  );
}

export function isAnchorName(value: unknown): value is string {
  return typeof value === 'string'
    && /^[A-Za-z_][-A-Za-z0-9._]*$/.test(value);
}

export function isHasAnchor(
  possibleSchema: unknown,
): possibleSchema is HasAnchor {
  return typeof possibleSchema === 'object'
    && possibleSchema !== null
    && '$anchor' in possibleSchema
    && isAnchorName(possibleSchema.$anchor);
}

export function isHasDynamicAnchor(
  possibleSchema: unknown,
): possibleSchema is HasDynamicAnchor {
  return typeof possibleSchema === 'object'
    && possibleSchema !== null
    && '$dynamicAnchor' in possibleSchema
    && isAnchorName(possibleSchema.$dynamicAnchor);
}

export function isHasIf(
  possibleSchema: unknown,
): possibleSchema is HasIf<object, object> {
  return (
    typeof possibleSchema === 'object'
    && possibleSchema !== null
    && 'if' in possibleSchema
    && typeof possibleSchema.if === 'object'
    && possibleSchema.if !== null
    && !!possibleSchema.if
  );
}

export function isHasNot(
  possibleSchema: unknown,
): possibleSchema is HasNot<Schema | boolean> {
  if (typeof possibleSchema !== 'object'
    || possibleSchema === null
    || Array.isArray(possibleSchema)
    || !('not' in possibleSchema)
  ) {
    return false;
  }

  const childSchema = possibleSchema.not;

  return typeof childSchema === 'boolean'
    || (typeof childSchema === 'object'
      && childSchema !== null
      && !Array.isArray(childSchema));
}

export function isSchema(
  possibleSchema: unknown,
): possibleSchema is Schema {
  return isSchemaArray(possibleSchema)
    || isSchemaBoolean(possibleSchema)
    || isSchemaInteger(possibleSchema)
    || isSchemaNull(possibleSchema)
    || isSchemaNumber(possibleSchema)
    || isSchemaObject(possibleSchema)
    || isSchemaString(possibleSchema)
    || isHasRef(possibleSchema)
    || isHasDynamicRef(possibleSchema)
    || isHasAnchor(possibleSchema)
    || isHasDynamicAnchor(possibleSchema);
}

export function isNotSgnificantSchema(schema: unknown): boolean {
  if (typeof schema !== 'object'
    || schema === null
    || Array.isArray(schema)
    || 'enum' in schema
    || 'const' in schema
    || 'not' in schema
  ) {
    return false;
  }

  if (isSchemaObject(schema, true)) {
    return [
      'properties',
      'patternProperties',
      'propertyNames',
      'additionalProperties',
      'unevaluatedProperties',
    ].every((property) => !(property in schema));
  }

  if (isSchemaString(schema, true)) {
    return !('pattern' in schema || 'format' in schema);
  }

  if (isSchemaArray(schema, true)) {
    return [
      'additionalItems',
      'items',
      'prefixItems',
      'unevaluatedItems',
    ].every((property) => !(property in schema));
  }

  return false;
}

const numericSchemaProperties = [
  'exclusiveMaximum',
  'exclusiveMinimum',
  'maximum',
  'minimum',
  'multipleOf',
];

function isSchemaWithInferredType(
  possibleSchema: unknown,
  schemaType: SchemaType,
  isMatchingValue: (value: unknown) => boolean,
  typeSpecificProperties: string[],
  shouldSkipCombinedVariantsCheck: boolean,
): boolean {
  if (typeof possibleSchema !== 'object' || !possibleSchema) {
    return false;
  }

  if (isVariativeSchema(possibleSchema, schemaType)) {
    return true;
  }

  if ('type' in possibleSchema) {
    return possibleSchema.type === schemaType;
  }

  if (typeSpecificProperties.some((property) => property in possibleSchema)) {
    return true;
  }

  if ('const' in possibleSchema) {
    return isMatchingValue(possibleSchema.const);
  }

  if ('enum' in possibleSchema && Array.isArray(possibleSchema.enum)) {
    return possibleSchema.enum.length > 0
      && possibleSchema.enum.every((value) => isMatchingValue(value));
  }

  if ('default' in possibleSchema) {
    return isMatchingValue(possibleSchema.default);
  }

  if ('example' in possibleSchema) {
    return isMatchingValue(possibleSchema.example);
  }

  if ('examples' in possibleSchema
    && Array.isArray(possibleSchema.examples)
  ) {
    return possibleSchema.examples.length > 0
      && possibleSchema.examples.every((value) => isMatchingValue(value));
  }

  if (!shouldSkipCombinedVariantsCheck && isHasCombinedVariants(possibleSchema)) {
    return areAllCombinedVariantsSatisfyPredicate(
      possibleSchema,
      (pureParentSchema, subSchema) => {
        if (typeof pureParentSchema !== 'object'
          || pureParentSchema === null
          || typeof subSchema !== 'object'
          || subSchema === null
        ) {
          return false;
        }

        return isSchemaWithInferredType(
          { ...pureParentSchema, ...subSchema },
          schemaType,
          isMatchingValue,
          typeSpecificProperties,
          true,
        );
      },
    );
  }

  return false;
}
