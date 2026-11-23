import type { HeaderParameter } from './header-parameter';
import type { ParameterStyle } from './parameter-style';
import type { ReferenceObject } from './reference-object';

/**
 * Encoding of one property in a form or multipart request body.
 */
export interface Encoding {
  contentType?: string;
  headers?: Record<string, HeaderParameter | ReferenceObject>;
  style?: ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
}
