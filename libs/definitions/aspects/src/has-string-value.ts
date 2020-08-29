/**
 * @see http://json-schema.org/understanding-json-schema/reference/string.html#built-in-formats
 */
export enum BuiltInFormat {
    Date = 'date',
    DateTime = 'date-time',
    Email = 'email',
    Hostname = 'hostname',
    IdnEmail = 'idn-email',
    Iri = 'iri',
    IriReference = 'iri-reference',
    Ipv4 = 'ipv4',
    Ipv6 = 'ipv6',
    Time = 'time',
    Uri = 'uri',
    UriReference = 'uri-reference'
}

export interface HasStringValue {
    format: BuiltInFormat | string;
    minLength: number;
    maxLength: number;
    pattern: number;
}
