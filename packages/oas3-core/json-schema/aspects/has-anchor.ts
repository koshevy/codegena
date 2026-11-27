/**
 * A name that identifies a schema within its resource.
 * @see https://json-schema.org/draft/2020-12/json-schema-core.html#section-8.2.2
 */
export interface HasAnchor {
  $anchor: string;
}

export type CanHaveAnchor = Partial<HasAnchor>;

/**
 * A named anchor that can be targeted by a dynamic reference.
 * @see https://json-schema.org/draft/2020-12/json-schema-core.html#section-8.2.2
 */
export interface HasDynamicAnchor {
  $dynamicAnchor: string;
}

export type CanHaveDynamicAnchor = Partial<HasDynamicAnchor>;
