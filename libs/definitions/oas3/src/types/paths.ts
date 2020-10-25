import { PathItem } from './path-item';

/**
 * Holds the relative paths to the individual endpoints and their operations.
 * The path is appended to the URL from the Server Object in order to construct
 * the full URL. The Paths MAY be empty, due to
 * {@link https://swagger.io/specification/#securityFiltering | ACL constraints}.
 *
 * @see https://swagger.io/specification/#pathsObject
 */
export interface Paths {
    /**
     * Field Pattern: /{path}
     */
    [path: string]: PathItem;
}
