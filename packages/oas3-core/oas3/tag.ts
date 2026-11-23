import type { ExternalDocument } from './external-document';

/**
 * Metadata for a tag used to group operations.
 */
export interface Tag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocument;
}
