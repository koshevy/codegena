/**
 * Controls the XML representation of a schema property.
 *
 * @see https://spec.openapis.org/oas/v3.0.3#xml-object
 */
export interface XmlMetadata {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}
