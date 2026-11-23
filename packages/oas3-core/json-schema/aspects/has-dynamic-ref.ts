/**
 * A schema reference resolved through a dynamic anchor.
 * @see https://json-schema.org/draft/2020-12/json-schema-core.html#section-8.2.3.2
 */
export interface HasDynamicRef {
  $dynamicRef: string;
}

export type CanHaveDynamicRef = Partial<HasDynamicRef>;
