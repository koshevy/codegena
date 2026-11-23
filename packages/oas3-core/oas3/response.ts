import { MediaContent } from './aspects';
import { Headers } from './headers';
import { Link } from './link';
import { ReferenceObject } from './reference-object';

/**
 * Describes a single response from an API Operation, including design-time,
 * static `links` to operations based on the response.
 *
 * @see https://spec.openapis.org/oas/v3.0.3#response-object
 */
export interface Response {
  /**
   * REQUIRED. A short description of the response. CommonMark syntax MAY be
   * used for rich text representation.
   */
  description: string;

  /**
   * Maps case-insensitive header names to definitions. A `Content-Type`
   * header is ignored because the media type belongs in `content`.
   */
  headers?: Headers;

  /**
   * Descriptions of possible response payloads.
   */
  content?: Record<string, MediaContent>;

  /**
   * Operations that can be followed from this response, keyed by link name.
   */
  links?: Record<string, Link | ReferenceObject>;
}
