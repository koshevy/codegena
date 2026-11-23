/**
 * Constant values
 *
 * New in draft 6
 * @see http://json-schema.org/understanding-json-schema/reference/generic.html
 */
export interface HasConstValue<TValue> {
  const: TValue;
}

export type CanHaveConstValue<TValue> = Partial<HasConstValue<TValue>>;
