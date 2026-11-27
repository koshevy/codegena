/**
 * @see https://json-schema.org/understanding-json-schema/reference/combining#not
 */
export interface HasNot<TSchema = unknown> {
  not: TSchema;
}
