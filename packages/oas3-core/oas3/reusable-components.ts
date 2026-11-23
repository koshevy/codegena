import type { Callback } from './callback';
import type { ExampleObject } from './example-object';
import type { HeaderParameter } from './header-parameter';
import type { Link } from './link';
import type { Oas3Schema } from './oas3-schema';
import type { Parameter } from './parameter';
import type { PathItem } from './path-item';
import type { ReferenceObject } from './reference-object';
import type { Request } from './request';
import type { Response } from './response';
import type { SecurityScheme } from './security-scheme';

/**
 * Named objects that can be reused through OpenAPI references.
 */
export interface ReusableComponents {
  callbacks?: Record<string, Callback | ReferenceObject>;
  examples?: Record<string, ExampleObject | ReferenceObject>;
  headers?: Record<string, HeaderParameter | ReferenceObject>;
  links?: Record<string, Link | ReferenceObject>;
  parameters?: Record<string, Parameter | ReferenceObject>;
  pathItems?: Record<string, PathItem | ReferenceObject>;
  requestBodies?: Record<string, Request | ReferenceObject>;
  responses?: Record<string, Response | ReferenceObject>;
  schemas?: Record<string, Oas3Schema | ReferenceObject>;
  securitySchemes?: Record<string, SecurityScheme | ReferenceObject>;
}
