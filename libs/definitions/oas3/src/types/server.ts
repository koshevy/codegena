import { ServerVariable } from './server-variable';

/**
 * @see https://swagger.io/specification/#serverObject
 */
export interface Server {
    /**
     * An optional string describing the host designated by the URL.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * Extended non-standard option which describes what the
     * type of environment should be associated with this server
     */
    environment?: string;

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
     * @see https://swagger.io/specification/#serverVariableObject
     */
    variables?: Record<string, ServerVariable>;
}
