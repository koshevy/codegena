import { HasExample } from '@codegena/definitions/aspects';
import { Schema } from '@codegena/definitions/json-schema';

/**
 * Each Media Type Object provides schema and examples for the media type
 * identified by its key.
 *
 * @see https://swagger.io/specification/#mediaTypeObject
 */
export interface MediaContent extends HasExample {

    /**
     * The schema defining the content of the request, response, or parameter.
     */
    schema?: Schema;

    /**
     * https://swagger.io/specification/#encodingObject
     * TODO describe and support media type encoding. now is not
     */
    encoding?: any;
}
