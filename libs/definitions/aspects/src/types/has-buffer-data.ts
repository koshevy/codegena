/**
 * Media: string-encoding non-JSON data
 *
 * New in draft 7
 * @see http://json-schema.org/understanding-json-schema/reference/non_json_data.html
 */
export interface HasBufferData{
    contentEncoding: string;
    contentMediaType: string;
}
