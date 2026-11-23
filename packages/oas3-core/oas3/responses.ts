import type { ReferenceObject } from './reference-object';
import type { Response } from './response';

/**
 * Status codes, status-code ranges, and `default` map to responses.
 */
export type Responses = Record<string, Response | ReferenceObject>;
