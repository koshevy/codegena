/**
 * @see http://json-schema.org/understanding-json-schema/reference/string.html#built-in-formats
 */
export type BuiltInFormat = | 'date'
                            | 'date-time'
                            | 'email'
                            | 'hostname'
                            | 'idn-email'
                            | 'iri'
                            | 'iri-reference'
                            | 'ipv4'
                            | 'ipv6'
                            | 'time'
                            | 'uri'
                            | 'uri-reference';

export interface HasStringValue<TFormat = BuiltInFormat> {
    format: TFormat;
    minLength: number;
    maxLength: number;
    pattern: string;
}
