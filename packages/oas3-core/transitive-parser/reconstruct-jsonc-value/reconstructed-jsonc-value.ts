import type { Logger } from '@codegena/oas3-core/logger';
import type { Node } from 'jsonc-parser';

/**
 * Reconstructed value is a complex value obtained
 * as a result of reading of AST-parsed JSON.
 * It combines ready to use deeply reconstructed value
 * (including arrays and objects) in `value` and related meta.
 */
export interface ReconstructedScalarJsoncValue<
  TValue = unknown,
> {
  /**
   * Has to be wrapped in a function to avoid direct
   * text copying between tree nodes making heap overhead
   */
  getOriginalFileContent: () => string;
  jsonPath: string[];
  node: Node;
  sourceFileId: string;
  parentValue?: Record<string, unknown> | unknown[];
  value: TValue;
}

export interface HasJsonEntriesList {
  jsonEntries: string[];
}

export interface ReconstructedObjectJsoncValue<
  TKey extends string | number | symbol = string,
  TComplexValue extends Record<TKey, unknown> = Record<TKey, unknown>,
> extends ReconstructedScalarJsoncValue<TComplexValue>,
  Partial<HasJsonEntriesList> {
  properties: Record<TKey, ReconstructedJsoncValue>;
}

export interface ReconstructedArrayJsoncValue<
  TComplexValue extends unknown[] = unknown[],
> extends ReconstructedScalarJsoncValue<TComplexValue>,
  Partial<HasJsonEntriesList> {
  items: ReconstructedJsoncValue[];
}

/**
 * `ReconstructedJsoncValue` is a value processed from a
 * {@link import('jsonc-parser')} combining the meta information,
 * ready to use data and indexing information.
 *
 * `ReconstructedJsoncValue` allows to use data from a JSON, get information
 * about associated AST-nodes.
 */
export type ReconstructedJsoncValue = (
  | ReconstructedScalarJsoncValue
  | ReconstructedObjectJsoncValue
  | ReconstructedArrayJsoncValue
);

export type ReconstructJsoncFn = (
  node: Node,
  sourceFileId: string,
  getOriginalFileContent: () => string,
  circularFnLinks: {
    array: ReconstructJsoncFn;
    object: ReconstructJsoncFn;
    unknown: ReconstructJsoncFn;
  },
  jsonPath: string[],
  logger?: Logger,
  // eslint-disable-next-line max-params
) => ReconstructedJsoncValue;
