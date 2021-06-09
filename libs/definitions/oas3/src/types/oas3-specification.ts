import { ExternalDocument } from './external-document';
import { Info } from './info';
import { Paths } from './paths';
import { ReusableComponents } from './reusable-components';
import { Server } from './server';

/**
 * Complete
 */
export interface Oas3Specification {
    /**
     * REQUIRED. This string MUST be the semantic version number of the
     * OpenAPI Specification version that the OpenAPI document uses.
     * The `openapi` field SHOULD be used by tooling specifications and clients
     * to interpret the OpenAPI document. This is not related to the API
     * {@link https://swagger.io/specification/#infoVersion | info.version string}.
     */
    openapi: '3.0.3' | '3.0.2' | '3.0.1' | '3.0.0' | '2.0.0';

    /**
     * REQUIRED. Provides metadata about the API.
     * The metadata MAY be used by tooling as required.
     */
    info: Info;

    /**
     * An array of Server Objects, which provide connectivity information to a
     * target `server`. If the servers property is not provided, or is an empty array,
     * the default value would be a `Server Object` with a url value of `/`.
     *
     * @see https://swagger.io/specification/#serverObject
     */
    servers: Server[];

    /**
     * REQUIRED. The available paths and operations for the API.
     *
     * @see https://swagger.io/specification/#pathsObject
     */
    paths: Paths;

    /**
     * Holds a set of reusable objects for different aspects of the OAS.
     * All objects defined within the schema object will have no effect on
     * the API unless they are explicitly referenced from properties outside the
     * schema object.
     *
     * @see https://swagger.io/specification/#componentsObject
     */
    components: ReusableComponents;

    /**
     * A declaration of which security mechanisms can be used across the API.
     * The list of values includes alternative security requirement objects that
     * can be used. Only one of the security requirement objects need to be satisfied
     * to authorize a request. Individual operations can override this definition.
     *
     * @see https://swagger.io/specification/#securityRequirementObject
     *
     * TODO describe and implement support of security
     */
    security: any;

    /**
     * A list of tags used by the specification with additional metadata.
     * The order of the tags can be used to reflect on their order by the parsing tools.
     * Not all tags that are used by the
     * {@link https://swagger.io/specification/#operationObject | Operation Object}
     * must be declared. The tags that are not declared MAY be organized randomly
     * or based on the tools' logic. Each tag name in the list MUST be unique.
     *
     * TODO describe and implement support of tags
     */
    tags: any[];

    /**
     * Additional external documentation.
     * @see https://swagger.io/specification/#externalDocumentationObject
     *
     * TODO describe and implement support of externalDocs
     */
    externalDocs?: ExternalDocument;
}
