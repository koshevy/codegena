import { HasContent } from './aspects';

/**
 * Request Body Object. Describes a single request body.
 * @see https://swagger.io/specification/#requestBodyObject
 */
export interface Request extends HasContent {
  /**
   * A brief description of the request body. This could contain examples of
   * use. CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * Determines if the request body is required in the request. Defaults to `false`.
   */
  required?: boolean;
}
