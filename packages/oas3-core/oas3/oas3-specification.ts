import { ExternalDocument } from './external-document';
import { Info } from './info';
import { PathItem } from './path-item';
import { Paths } from './paths';
import { ReferenceObject } from './reference-object';
import { ReusableComponents } from './reusable-components';
import { SecurityRequirement } from './security-requirement';
import { Server } from './server';
import { Tag } from './tag';

interface Oas3Common {
  info: Info;
  servers?: Server[];
  components?: ReusableComponents;
  security?: SecurityRequirement[];
  tags?: Tag[];
  externalDocs?: ExternalDocument;
}

/**
 * OpenAPI 3.0 requires `paths`; later 3.x versions also allow webhooks.
 */
export type Oas3Specification = Oas3Common & (
  | {
    openapi: `3.0.${number}`;
    paths: Paths;
  }
  | {
    openapi: `3.${1 | 2}.${number}`;
    $self?: string;
    jsonSchemaDialect?: string;
    paths?: Paths;
    webhooks?: Record<string, PathItem | ReferenceObject>;
  }
);
