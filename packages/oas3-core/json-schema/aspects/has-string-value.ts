/**
 * @see
 * https://json-schema.org/understanding-json-schema/reference/type#built-in-formats
 */
export type BuiltInFormat = (
  | 'date'
  | 'date-time'
  | 'duration'
  | 'email'
  | 'hostname'
  | 'idn-email'
  | 'idn-hostname'
  | 'iri'
  | 'iri-reference'
  | 'ipv4'
  | 'ipv6'
  | 'json-pointer'
  | 'regex'
  | 'relative-json-pointer'
  | 'time'
  | 'uri'
  | 'uri-reference'
  | 'uri-template'
  | 'uuid'
);

export type StringFormat = BuiltInFormat;

export interface HasStringValue<TFormat = StringFormat> {
  format: TFormat;
  minLength: number;
  maxLength: number;
  pattern: string;
}

export type CanHaveValue = Partial<
  HasStringValue
>;
