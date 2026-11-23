/**
 * OpenAPI's singular example keyword.
 */
export interface HasExample<TValue = unknown> {
  example: TValue;
}

export type CanHaveExample<TValue = unknown> = Partial<HasExample<TValue>>;
