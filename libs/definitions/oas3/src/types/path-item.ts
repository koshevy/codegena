import { HasRef } from '@codegena/definitions/aspects';
import { Operation } from './operation';
import { Parameter } from './parameter';

/**
 * Describes the operations available on a single path. A Path Item MAY be empty,
 * due to {@link https://swagger.io/specification/#securityFiltering | ACL constraints}.
 * The path itself is still exposed to the documentation
 * viewer but they will not know which operations and parameters are available.
 *
 * @see https://swagger.io/specification/#pathItemObject
 */
export interface PathItem extends HasRef {
    /**
     * An optional, string summary, intended to apply
     * to all operations in this path.
     * TODO support common summary in path. now is not
     */
    summary?: string;

    /**
     * An optional, string description, intended to apply to all
     * operations in this path. CommonMark syntax MAY be used
     * for rich text representation.
     * TODO support common description in path. now is not
     */
    description?: string;

    /**
     * A list of parameters that are applicable for all the operations described
     * under this path. These parameters can be overridden at the operation level,
     * but cannot be removed there. The list MUST NOT include duplicated parameters.
     * A unique parameter is defined by a combination of a name and location.
     * The list can use the Reference Object to link to parameters that are
     * defined at the OpenAPI Object's schema/parameters.
     * TODO support common parameters in path. now is not
     */
    parameters?: Parameter[];

    // Methods:

    delete?: Operation;
    get?: Operation;
    head?: Operation;
    options?: Operation;
    patch?: Operation;
    post?: Operation;
    put?: Operation;
    trace?: Operation;
}
