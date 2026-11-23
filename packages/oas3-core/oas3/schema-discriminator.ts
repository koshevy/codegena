/**
 * Identifies the property used to select a polymorphic schema variant.
 *
 * @see https://spec.openapis.org/oas/v3.0.3#discriminator-object
 */
export interface SchemaDiscriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}
