/**
 * A reference to a reusable OpenAPI object outside a Schema Object.
 */
export interface ReferenceObject {
  $ref: string;
  description?: string;
  summary?: string;
}
