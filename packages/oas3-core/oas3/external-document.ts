/**
 * Allows referencing an external resource for extended documentation.
 */
export interface ExternalDocument {
  /**
   * A short description of the target documentation.
   * CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;

  /**
   * REQUIRED. The URL for the target documentation.
   * Value MUST be in the format of a URL.
   */
  url: string;
}
