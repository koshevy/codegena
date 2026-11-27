import type { Schema, StringFormat } from '../json-schema';
import type { CanHaveExample, CanHaveNullable } from './aspects';
import type { ExternalDocument } from './external-document';
import type { OpenApiStringFormat } from './open-api-string-format';
import type { SchemaDiscriminator } from './schema-discriminator';
import type { XmlMetadata } from './xml-metadata';

/**
 * JSON Schema with OpenAPI schema-specific fields.
 * `nullable` applies to OpenAPI 3.0 documents.
 */
export type Oas3Schema<TValue = unknown> = (
  & Schema
  & CanHaveExample<TValue>
  & CanHaveNullable
  & {
    discriminator?: SchemaDiscriminator;
    externalDocs?: ExternalDocument;
    format?: StringFormat | OpenApiStringFormat;
    xml?: XmlMetadata;
  }
);
