/* eslint-disable max-len */
/**
 * @see https://json-schema.org/understanding-json-schema/reference/conditionals#dependentRequired
 */
/* eslint-enable max-len */
export interface HasDependentRequired {
  dependentRequired: Record<string, string[]>;
}
