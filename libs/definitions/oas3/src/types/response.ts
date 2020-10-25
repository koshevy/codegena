import { HasRef } from '@codegena/definitions/aspects';
import { Schema } from '@codegena/definitions/json-schema';
import { HasContent } from './has-content';
import { ExternalDocument } from './external-document';
import { Headers } from './headers';

/**
 * Describes a single response from an API Operation, including design-time,
 * static `links` to operations based on the response.
 *
 * @see @link https://swagger.io/specification/#responseObject
 * @see HasContent
 */
export interface Response extends HasRef, HasContent {

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
    externalDocs?: ExternalDocument;

    /**
     * Maps a header name to its definition. RFC7230 states header names are case
     * insensitive. If a response header is defined with the name "Content-Type",
     * it SHALL be ignored.
     *
     * TODO describe and support headers in response. now is not. Important!
     */
    headers: Headers;

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
     * @deprecated Not OAS3: in order to support OAS2
     */
    schema: Schema;
}
