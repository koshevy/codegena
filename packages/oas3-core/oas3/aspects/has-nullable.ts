/**
 * OpenAPI 3.0's nullable schema keyword.
 */
export interface HasNullable {
  nullable: boolean;
}

export type CanHaveNullable = Partial<HasNullable>;
