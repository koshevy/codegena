import {
    SchemaArray,
    SchemaBoolean,
    SchemaInteger,
    SchemaNumber,
    SchemaObject,
    SchemaString
} from './schema';

export interface HasContent {
    /**
     * REQUIRED. The content of the request body. The key is a media type or
     * {@link https://tools.ietf.org/html/rfc7231#appendix-D | media type range}
     * and the value describes it. For requests that match multiple keys,
     * only the most specific key is applicable. e.g. `"text/plain"` overrides `"text/*"`
     */
    content: OApiMediaTypes;
}

export interface HasExamples {

    /**
     * Example of the media type. The example object SHOULD be in the correct
     * format as specified by the media type. The `example` field is mutually
     * exclusive of the `examples` field. Furthermore, if referencing a `schema`
     * which contains an `example`, the example value SHALL override the example
     * provided by the schema.
     */
    example: any;

    /**
     * Examples of the media type. Each example object SHOULD match the media
     * type and specified schema if present. The `examples` field is mutually
     * exclusive of the `example` field. Furthermore, if referencing a schema
     * which contains an example, the `examples` value SHALL override the example
     * provided by the schema.
     *
     * TODO describe and support media type examples. now is not
     */
    examples: {
        [key: string]: any;
    };
}

export interface HasRef {
    $ref?: string;
}

/**
 * This is the root document object of the OpenAPI document.
 *
 * @see https://swagger.io/specification/#openapi-object
 */
export interface OApiStructure {

    /**
     * REQUIRED. This string MUST be the semantic version number of the
     * OpenAPI Specification version that the OpenAPI document uses.
     * The `openapi` field SHOULD be used by tooling specifications and clients
     * to interpret the OpenAPI document. This is not related to the API
     * {@link https://swagger.io/specification/#infoVersion | info.version string}.
     */
    openapi: '3.0.1' | '3.0.0' | '2.0.0';

    /**
     * REQUIRED. Provides metadata about the API.
     * The metadata MAY be used by tooling as required.
     */
    info: OApiInfo;

    /**
     * An array of Server Objects, which provide connectivity information to a
     * target `server`. If the servers property is not provided, or is an empty array,
     * the default value would be a `Server Object` with a url value of `/`.
     *
     * @see https://swagger.io/specification/#serverObject
     */
    servers: OApiServer[];

    /**
     * REQUIRED. The available paths and operations for the API.
     *
     * @see https://swagger.io/specification/#pathsObject
     */
    paths: OApiPaths;

    /**
     * Holds a set of reusable objects for different aspects of the OAS.
     * All objects defined within the schema object will have no effect on
     * the API unless they are explicitly referenced from properties outside the
     * schema object.
     *
     * @see https://swagger.io/specification/#componentsObject
     */
    components: OApiReusableComponents;

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
    externalDocs?: OApiExternalDocument;
}

/**
 * @see https://swagger.io/specification/#infoObject
 */
export interface OApiInfo {
    contact?: OApiContact;
    description?: string;
    license?: OApiLicense;
    termsOfService?: string;
    title: string;
    version: string;
}

/**
 * @see https://swagger.io/specification/#contactObject
 */
export interface OApiContact {
    email: string;
    name: string;
    url: string;
}

/**
 * @see https://swagger.io/specification/#licenseObject
 */
export interface OApiLicense {
    email: string;
    name: string;
    url?: string;
}

/**
 * @see https://swagger.io/specification/#serverObject
 */
export interface OApiServer {
    /**
     * An optional string describing the host designated by the URL.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * REQUIRED. A URL to the target host. This URL supports Server Variables and MAY be relative,
     * to indicate that the host location is relative to the location where the OpenAPI document is
     * being served. Variable substitutions will be made when a variable is named in {brackets}.
     */
    url: string;

    /**
     * A map between a variable name and its value.
     * The value is used for substitution in the server's URL template.
     *
     * TODO support variables in server. now is not
     * @ see https://swagger.io/specification/#serverVariableObject
     */
    variables?: any;
}

/**
 * Holds the relative paths to the individual endpoints and their operations.
 * The path is appended to the URL from the Server Object in order to construct
 * the full URL. The Paths MAY be empty, due to
 * {@link https://swagger.io/specification/#securityFiltering | ACL constraints}.
 *
 * @see https://swagger.io/specification/#pathsObject
 */
export interface OApiPaths {
    /**
     * Field Pattern: /{path}
     */
    [path: string]: OApiPathItem;
}

/**
 * Describes the operations available on a single path. A Path Item MAY be empty,
 * due to {@link https://swagger.io/specification/#securityFiltering | ACL constraints}.
 * The path itself is still exposed to the documentation
 * viewer but they will not know which operations and parameters are available.
 *
 * @see https://swagger.io/specification/#pathItemObject
 */
export interface OApiPathItem extends HasRef {
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
    parameters?: OApiParameter[];

    // Methods:

    delete?: OApiOperation;
    get?: OApiOperation;
    head?: OApiOperation;
    options?: OApiOperation;
    patch?: OApiOperation;
    post?: OApiOperation;
    put?: OApiOperation;
    trace?: OApiOperation;
}

export enum OApiPathItemMethods {
    delete = 'delete',
    get = 'get',
    head = 'head',
    options = 'options',
    patch = 'patch',
    post = 'post',
    put = 'put',
    trace = 'trace'
}

/**
 * Base ancestor for {@link OApiParameter} and {@link OApiHeaderParameter}.
 */
export interface OApiParameterBase {
    /**
     * Determines whether the parameter value SHOULD allow reserved characters,
     * as defined by
     * {@link https://tools.ietf.org/html/rfc3986#section-2.2 | RFC3986}
     * `:/?#[]@!$&'()*+,;=` to be included without percent-encoding.
     * This property only applies to parameters with an `in` value of `query`.
     *
     * The default value is `false`.
     *
     * TODO describe and support allowReserved in parameter. now is not
     */
    allowReserved: boolean;

    /**
     * Sets the ability to pass empty-valued parameters. This is valid only for
     * `query` parameters and allows sending a parameter with an empty value.
     * Default value is `false`.
     * If {@link https://swagger.io/specification/#parameterStyle | style}
     * is used, and if behavior is n/a (cannot be serialized), the value of
     * `allowEmptyValue` SHALL be ignored.
     *
     * @deprecated
     * Use of this property is NOT RECOMMENDED,
     * as it is likely to be removed in a later revision.
     */
    allowEmptyValue?: boolean;

    /**
     * A brief description of the parameter. This could contain examples of use.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * Specifies that a parameter is deprecated and SHOULD be transitioned out
     * of usage. Default value is false.
     *
     * TODO describe and support deprecated in parameter. now is not
     */
    deprecated?: boolean;

    /**
     * When this is true, parameter values of type `array` or `object` generate separate parameters
     * for each value of the array or key-value pair of the map. For other types of parameters this
     * property has no effect. When `style` is form, the default value is `true`. For all other
     * styles, the default value is `false`.
     *
     * @see https://swagger.io/docs/specification/serialization/
     * @see OApiParameter.style
     *
     * TODO describe and support explode in parameter. now is not. Important!
     * FIXME describe and support explode in parameter. now is not. Important!
     */
    explode?: boolean;

    /**
     * Determines whether this parameter is mandatory. If the `in`
     * is "path", this property is REQUIRED and its value MUST be true.
     * Otherwise, the property MAY be included and its default value is false.
     */
    required: boolean;

    /**
     * The schema defining the type used for the parameter.
     */
    schema?: | SchemaArray
             | SchemaObject
             | SchemaInteger
             | SchemaNumber
             | SchemaObject
             | SchemaString;

    /**
     * Describes how the parameter value will be serialized depending on the
     * type of the parameter value. Default values (based on value of `in`):
     *  - for `'query'` - `'form'`;
     *  - for `'path'` - `'simple'`;
     *  - for `'header'` - `'simple'`;
     *  - for `'cookie'` - `'form'`.
     *
     * @see https://swagger.io/docs/specification/serialization/
     * @see OApiParameter.explode
     *
     * TODO describe and support style in parameter. now is not. Important!
     * FIXME describe and support style in parameter. now is not. Important!
     */
    style?: OApiParameterStyle;
}

/**
 * Describes a single operation parameter.
 * A unique parameter is defined by a combination of a
 * {@link https://swagger.io/specification/#parameterName | name}
 * and
 * {@link https://swagger.io/specification/#parameterIn | location}.
 *
 * @see https://swagger.io/specification/#parameterObject
 * @see https://swagger.io/docs/specification/describing-parameters/
 */
export interface OApiParameter extends HasRef, HasExamples, OApiParameterBase {

    /**
     * REQUIRED. The location of the parameter. Possible values are:
     * - "query",
     * - "header"
     * - "path"
     * - "cookie"
     */
    in: OApiParameterIn;

    /**
     * REQUIRED. The name of the parameter. Parameter names are case sensitive.
     *
     * @see https://swagger.io/specification/#parameterObject
     */
    name: string;

    /**
     * @deprecated
     * Not in {@link https://swagger.io/specification/#parameterObject | Open API specification }.
     * Makes extracted schema of params supporting `readonly` params.
     */
    readOnly?: boolean;
}

/**
 * Parameter in {@link https://swagger.io/specification/#headerObject}.
 */
export interface OApiHeaderParameter extends HasRef, HasExamples, OApiParameterBase {
    /**
     * Describes how the parameter value will be serialized depending on the
     * type of the parameter value. Default values (based on value of `in`):
     *  - for `'query'` - `'form'`;
     *  - for `'path'` - `'simple'`;
     *  - for `'header'` - `'simple'`;
     *  - for `'cookie'` - `'form'`.
     *
     * @see https://swagger.io/docs/specification/serialization/
     * @see OApiParameter.explode
     *
     * TODO describe and support style in parameter. now is not. Important!
     * FIXME describe and support style in parameter. now is not. Important!
     */
    style?: OApiParameterStyle.Simple;
}

/**
 * @see OApiParameter.in
 */
export enum OApiParameterIn {
    Path = 'path',
    Header = 'header',
    Query = 'query',
    Cookie = 'cookie',
}

/**
 * Describes a single API operation on a path.
 *
 * @see https://swagger.io/specification/#operationObject
 */
export interface OApiOperation {
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
    externalDocs?: OApiExternalDocument;

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
    parameters?: OApiParameter[];

    /**
     * The request body applicable for this operation. The `requestBody` is only
     * supported in HTTP methods where the HTTP 1.1 specification
     * {@link https://tools.ietf.org/html/rfc7231#section-4.3.1 | RFC7231 } has
     * explicitly defined semantics for request bodies. In other cases where
     * the HTTP spec is vague, `requestBody` SHALL be ignored by consumers.
     */
    requestBody?: OApiRequest;

    /**
     * REQUIRED.
     * The list of possible responses as they are returned from executing this operation.
     */
    responses: OApiResponsesSet;

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
    servers?: OApiServer[];

    /**
     * A list of tags for API documentation control. Tags can be used for logical
     * grouping of operations by resources or any other qualifier.
     */
    tags?: string[];
}

export interface OApiResponsesSet {
    /**
     * Default case, when needed status is not described.
     * Usually describe error answers.
     */
    default?: OApiResponse;

    // Possible codes
    '100'?: OApiResponse;
    '101'?: OApiResponse;
    '102'?: OApiResponse;
    '200'?: OApiResponse;
    '201'?: OApiResponse;
    '202'?: OApiResponse;
    '203'?: OApiResponse;
    '204'?: OApiResponse;
    '205'?: OApiResponse;
    '206'?: OApiResponse;
    '207'?: OApiResponse;
    '208'?: OApiResponse;
    '226'?: OApiResponse;
    '300'?: OApiResponse;
    '301'?: OApiResponse;
    '302'?: OApiResponse;
    '303'?: OApiResponse;
    '304'?: OApiResponse;
    '305'?: OApiResponse;
    '306'?: OApiResponse;
    '307'?: OApiResponse;
    '308'?: OApiResponse;
    '400'?: OApiResponse;
    '401'?: OApiResponse;
    '402'?: OApiResponse;
    '403'?: OApiResponse;
    '404'?: OApiResponse;
    '405'?: OApiResponse;
    '406'?: OApiResponse;
    '407'?: OApiResponse;
    '408'?: OApiResponse;
    '409'?: OApiResponse;
    '410'?: OApiResponse;
    '411'?: OApiResponse;
    '412'?: OApiResponse;
    '413'?: OApiResponse;
    '414'?: OApiResponse;
    '415'?: OApiResponse;
    '416'?: OApiResponse;
    '417'?: OApiResponse;
    '418'?: OApiResponse;
    '419'?: OApiResponse;
    '421'?: OApiResponse;
    '422'?: OApiResponse;
    '423'?: OApiResponse;
    '424'?: OApiResponse;
    '426'?: OApiResponse;
    '428'?: OApiResponse;
    '429'?: OApiResponse;
    '431'?: OApiResponse;
    '449'?: OApiResponse;
    '451'?: OApiResponse;
    '499'?: OApiResponse;
    '501'?: OApiResponse;
    '502'?: OApiResponse;
    '503'?: OApiResponse;
    '504'?: OApiResponse;
    '505'?: OApiResponse;
    '506'?: OApiResponse;
    '507'?: OApiResponse;
    '508'?: OApiResponse;
    '509'?: OApiResponse;
    '510'?: OApiResponse;
    '511'?: OApiResponse;
    '520'?: OApiResponse;
    '521'?: OApiResponse;
    '522'?: OApiResponse;
    '523'?: OApiResponse;
    '524'?: OApiResponse;
    '525'?: OApiResponse;
    '526'?: OApiResponse;
}

/**
 * Allows referencing an external resource for extended documentation.
 */
export interface OApiExternalDocument extends HasRef {
    /**
     * A short description of the target documentation.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * REQUIRED. The URL for the target documentation.
     * Value MUST be in the format of a URL.
     */
    url: string;
}

/**
 * Style of parameter serialization.
 * @see https://swagger.io/docs/specification/serialization/
 */
export enum OApiParameterStyle {
    Simple = 'simple',
    Label = 'label',
    Matrix = 'matrix',
    Form = 'form',
    SpaceDelimited = 'spaceDelimited',
    PipeDelimited = 'pipeDelimited',
    DeepObject = 'deepObject'
}

/**
 * Holds a set of reusable objects for different aspects of the OAS. All objects
 * defined within the schema object will have no effect on the API unless
 * they are explicitly referenced from properties outside the schema object.
 *
 * @see https://swagger.io/specification/#componentsObject
 */
export interface OApiReusableComponents {
    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#callbackObject | Callback Objects}.
     *
     * TODO describe and support component callbacks. now is not
     */
    callbacks: {
        [key: string]: any;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#exampleObject | Example Objects}.
     * TODO describe and support component examples. now is not
     */
    examples: {
        [key: string]: any;
    };

    /**
     * An object to hold reusable
     * {https://swagger.io/specification/#headerObject | Header Objects}.
     */
    headers: OApiHeaders;

    /**
     * An object to hold reusable
     * {https://swagger.io/specification/#linkObject | Link Objects}.
     * TODO describe and support component links. now is not
     */
    links: {
        [key: string]: any;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#parameterObject | Parameter Objects }.
     */
    parameters: {
        [key: string]: OApiParameter;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#requestBodyObject | Request Body Objects }.
     */
    requestBodies: {
        [key: string]: OApiRequest;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#responseObject | Response Objects}.
     */
    responses: {
        [key: string]: OApiResponse;
    };

    /**
     * An object to hold reusable
     * {@link https://swagger.io/specification/#securitySchemeObject | Security Scheme Objects}.
     * TODO describe and support component security schemes. now is not
     */
    securitySchemes: {
        [key: string]: any;
    };

    /**
     * An object to hold reusable Schema Objects.
     */
    schemas: {
        [key: string]: AnySchema;
    };
}

/**
 * Request Body Object. Describes a single request body.
 * @see https://swagger.io/specification/#requestBodyObject
 *
 * @see HasContent
 */
export interface OApiRequest extends HasContent, HasRef {
    /**
     * A brief description of the request body. This could contain examples of
     * use. CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * Determines if the request body is required in the request. Defaults to `false`.
     * TODO support request required. now is not
     */
    required?: boolean;
}

/**
 * Set of media types
 * @see https://swagger.io/specification/#mediaTypeObject
 * @see OApiMediaType
 */
export interface OApiMediaTypes {
    'application/javascript'?: OApiMediaType;
    'application/json'?: OApiMediaType;
    'application/octet-stream'?: OApiMediaType;
    'application/xml'?: OApiMediaType;
    'application/x-www-form-urlencoded'?: OApiMediaType;
    'text/html'?: OApiMediaType;
    'text/plain'?: OApiMediaType;
    'text/xml'?: OApiMediaType;
    'image/gif'?: OApiMediaType;
    'image/jpeg'?: OApiMediaType;
    'image/pjpeg'?: OApiMediaType;
    'image/png'?: OApiMediaType;
    'image/svg+xml'?: OApiMediaType;
    'multipart/form-data'?: OApiMediaType;
    'multipart/mixed'?: OApiMediaType;
    'multipart/related'?: OApiMediaType;

    /**
     * Any content types
     */
    [mediaType: string]: OApiMediaType;
}

/**
 * Each Media Type Object provides schema and examples for the media type
 * identified by its key.
 *
 * @see https://swagger.io/specification/#mediaTypeObject
 */
export interface OApiMediaType extends HasExamples {

    /**
     * The schema defining the content of the request, response, or parameter.
     */
    schema?: AnySchema;

    /**
     * https://swagger.io/specification/#encodingObject
     * TODO describe and support media type encoding. now is not
     */
    encoding?: any;
}

/**
 * Describes a single response from an API Operation, including design-time,
 * static `links` to operations based on the response.
 *
 * @see @link https://swagger.io/specification/#responseObject
 * @see HasContent
 */
export interface OApiResponse extends HasRef, HasContent, HasRef {

    /**
     * REQUIRED. A short description of the response. CommonMark syntax MAY be
     * used for rich text representation.
     */
    description: string;

    /**
     * Additional external documentation for this operation.
     *
     * TODO support operation externalDocs. now is not
     */
    externalDocs?: OApiExternalDocument;

    /**
     * Maps a header name to its definition. RFC7230 states header names are case
     * insensitive. If a response header is defined with the name "Content-Type",
     * it SHALL be ignored.
     *
     * TODO describe and support headers in response. now is not. Important!
     */
    headers: OApiHeaders;

    /**
     * A map of operations links that can be followed from the response.
     * The key of the map is a short name for the link, following the naming
     * constraints of the names for
     * {@link https://swagger.io/specification/#componentsObject | Component Objects}.
     *
     * @see OApiReusableComponents
     */
    links: {
        [key: string]: any;
    };

    /**
     * @deprecated
     * Not OAS3: in order to maintain OAS2
     */
    schema: AnySchema;
}

export interface OApiHeaders {
    [parameterName: string]: OApiHeaderParameter;
}

type AnySchema = | SchemaArray
                 | SchemaBoolean
                 | SchemaInteger
                 | SchemaNumber
                 | SchemaObject
                 | SchemaString;
