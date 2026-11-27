export interface HasItemsOptions {
  additionalItems: boolean;
  maxItems: number;
  minItems: number;
  uniqueItems: boolean;
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/array#contains
 */
export interface HasContains<TItemSchema> {
  contains: TItemSchema;
  minContains?: number;
  maxContains?: number;
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/array#items
 */
export interface HasItems<TItemSchema> {
  items: TItemSchema | boolean;
}

/**
 * @deprecated
 * Deprecated alternative of {@link HasPrefixItems.prefixItems }
 * from Draft 4 - 2019-09
 *
 * @see https://json-schema.org/understanding-json-schema/reference/array#tupleValidation
 */
export interface HasItemsDeprecated<TItemSchema> {
  items: TItemSchema[];
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/array#tupleValidation
 */
export interface HasPrefixItems<TItemSchema> {
  prefixItems: TItemSchema[];
  unevaluatedItems?: TItemSchema | boolean;
}

/**
 * JSON Schema Array options according to Draft 2020-12
 * @see https://json-schema.org/understanding-json-schema/reference/array
 * @see https://json-schema.org/draft/2020-12#draft-2020-12
 */
export type HasArrayValue<TItemSchema> = (
  & Partial<HasItemsOptions>
  & Partial<HasContains<TItemSchema>>
  & Partial<HasPrefixItems<TItemSchema>>
  & Partial<
    | HasItems<TItemSchema>
    | HasItemsDeprecated<TItemSchema>
  >
);
