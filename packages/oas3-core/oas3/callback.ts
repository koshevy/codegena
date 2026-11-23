import type { PathItem } from './path-item';
import type { ReferenceObject } from './reference-object';

/**
 * Runtime expressions map to callback path items.
 */
export type Callback = Record<string, PathItem | ReferenceObject>;
