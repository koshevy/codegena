import type { CanHaveExample } from './has-example';
import type { Encoding } from '../encoding';
import type { ExampleObject } from '../example-object';
import type { Oas3Schema } from '../oas3-schema';
import type { ReferenceObject } from '../reference-object';

/**
 * Each Media Type Object provides schema and examples for the media type
 * identified by its key.
 *
 * @see https://swagger.io/specification/#mediaTypeObject
 */
export interface MediaContent extends CanHaveExample {
  /**
   * The schema defining the content of the request, response, or parameter.
   */
  schema?: Oas3Schema | ReferenceObject | boolean;

  /**
   * Named examples, mutually exclusive with `example`.
   */
  examples?: Record<string, ExampleObject | ReferenceObject>;

  /**
   * Property-specific encodings for form and multipart request bodies.
   */
  encoding?: Record<string, Encoding>;
}
