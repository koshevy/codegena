import { HeaderParameter } from './header-parameter';
import { ReferenceObject } from './reference-object';

export type Headers = Record<string, HeaderParameter | ReferenceObject>;
