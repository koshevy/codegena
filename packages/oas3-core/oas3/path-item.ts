import { CanHaveRef } from '../json-schema';
import { Operation } from './operation';
import { OperationMethod } from './operation-method';
import { Parameter } from './parameter';
import { ReferenceObject } from './reference-object';
import { Server } from './server';

/**
 * Describes the operations available on a single path. A Path Item MAY be empty,
 * due to {@link https://swagger.io/specification/#securityFiltering | ACL constraints}.
 * The path itself is still exposed to the documentation
 * viewer, but they will not know which operations and parameters are available.
 *
 * @see https://swagger.io/specification/#pathItemObject
 */
export interface PathItem
  extends CanHaveRef, Partial<Record<OperationMethod, Operation>> {

  /**
   * Additional HTTP methods introduced in OpenAPI 3.2.
   *
   * @see https://spec.openapis.org/oas/v3.2.1.html#path-item-object
   */
  additionalOperations?: Record<string, Operation>;

  /**
   * An optional, string description, intended to apply to all
   * operations in this path. CommonMark syntax MAY be used
   * for rich text representation.
   */
  description?: string;

  /**
   * A list of parameters that are applicable for all the operations described
   * under this path. These parameters can be overridden at the operation level,
   * but cannot be removed there. The list MUST NOT include duplicated parameters.
   * A unique parameter is defined by a combination of a name and location.
   * The list can use the Reference Object to link to parameters that are
   * defined at the OpenAPI Object's schema/parameters.
   */
  parameters?: (Parameter | ReferenceObject)[];

  /**
   * Overrides the root server list for this path.
   */
  servers?: Server[];

  /**
   * An optional, string summary, intended to apply
   * to all operations in this path.
   */
  summary?: string;
}
