import { HasResponses } from '@codegena/definitions/aspects';
import { ExternalDocument } from './external-document';
import { Parameter } from './parameter';
import { Request } from './request';
import { Response } from './response';
import { Server } from './server';

/**
 * Describes a single API operation on a path.
 *
 * @see https://swagger.io/specification/#operationObject
 */
export interface Operation {
    /**
     * A map of possible out-of band callbacks related to the parent operation.
     * The key is a unique identifier for the
     * {@link https://swagger.io/specification/#callbackObject | Callback Object }.
     * Each value in the map is a Callback Object that describes a request that may
     * be initiated by the API provider and the expected responses. The key value
     * used to identify the callback object is an expression, evaluated at runtime,
     * that identifies a URL to use for the callback operation.
     *
     * TODO describe and support callbacks. now is not
     */
    callbacks?: any;

    /**
     * Declares this operation to be deprecated. Consumers SHOULD refrain from usage
     * of the declared operation. Default value is false.
     *
     * TODO support depracated operations. now is not
     */
    deprecated?: boolean;

    /**
     * A verbose explanation of the operation behavior.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * Additional external documentation for this operation.
     *
     * TODO support operation externalDocs. now is not
     */
    externalDocs?: ExternalDocument ;

    /**
     * Unique string used to identify the operation. The id MUST be unique among
     * all operations described in the API. The operationId value is case-sensitive.
     * Tools and libraries MAY use the operationId to uniquely identify an operation,
     * therefore, it is RECOMMENDED to follow common programming naming conventions.
     */
    operationId: string;

    /**
     * A list of parameters that are applicable for this operation. If a parameter
     * is already defined at the Path Item, the new definition will override it
     * but can never remove it. The list MUST NOT include duplicated parameters.
     * A unique parameter is defined by a combination of a name and location.
     * The list can use the Reference Object to link to parameters that are defined
     * at the OpenAPI Object's schema/parameters.
     */
    parameters?: Parameter[];

    /**
     * The request body applicable for this operation. The `requestBody` is only
     * supported in HTTP methods where the HTTP 1.1 specification
     * {@link https://tools.ietf.org/html/rfc7231#section-4.3.1 | RFC7231 } has
     * explicitly defined semantics for request bodies. In other cases where
     * the HTTP spec is vague, `requestBody` SHALL be ignored by consumers.
     */
    requestBody?: Request;

    /**
     * REQUIRED.
     * The list of possible responses as they are returned from executing this operation.
     */
    responses: HasResponses<Response>;

    /**
     * A declaration of which security mechanisms can be used for this operation.
     * The list of values includes alternative security requirement objects that
     * can be used. Only one of the security requirement objects need to be satisfied
     * to authorize a request. This definition overrides any declared top-level security.
     * To remove a top-level security declaration, an empty array can be used.
     *
     * @see https://swagger.io/specification/#securityRequirementObject
     *
     * TODO support operation security. now is not
     */
    security?: [any];

    /**
     * A short summary of what the operation does.
     *
     * TODO support operation summary. now is not
     */
    summary?: string;

    /**
     * An alternative server array to service this operation.
     * If an alternative server object is specified at the Path Item Object or
     * Root level, it will be overridden by this value.
     *
     * TODO support operation servers. now is not. Important!
     * FIXME support operation servers. now is not. Important!
     */
    servers?: Server[];

    /**
     * A list of tags for API documentation control. Tags can be used for logical
     * grouping of operations by resources or any other qualifier.
     */
    tags?: string[];
}
