import { defaultLogger } from '@codegena/oas3-core/logger';

import { appendJsonEntries } from './append-json-entries';
import { decoupleJsonEntries } from './decouple-json-entries';
import type {
  ReconstructedArrayJsoncValue,
  ReconstructJsoncFn,
} from './reconstructed-jsonc-value';
import { JsonParseError } from '../json-parse-error';

export const reconstructJsoncArray: ReconstructJsoncFn = (
  node,
  sourceFileId,
  getOriginalFileContent,
  circularFnLinks,
  jsonPath,
  logger = defaultLogger,
  // eslint-disable-next-line max-params
) => {
  if (node.type !== 'array') {
    throw new JsonParseError(
      'Node should be an object',
      getOriginalFileContent(),
      node,
      { logger, sourceFileId },
    );
  }

  const initialValue: ReconstructedArrayJsoncValue = {
    getOriginalFileContent,
    jsonPath: [...jsonPath],
    jsonEntries: [],
    items: [],
    node,
    sourceFileId,
    value: [],
  };

  if (!node.children?.length) {
    return initialValue;
  }

  return node.children.reduce<
    ReconstructedArrayJsoncValue
  >((result, itemNode, index) => {
    const itemJsonPath = [...jsonPath, String(index)];
    const reconstructedItem = circularFnLinks.unknown(
      itemNode,
      sourceFileId,
      getOriginalFileContent,
      circularFnLinks,
      itemJsonPath,
    );

    /**
     * The `jsonEntries` property is usable only at root level.
     * Duplicating at nested level creates significant memory overhead.
     */
    const {
      jsonEntries: nestedJsonEntries,
      reconstructedJsoncWithoutJsonEntries,
    } = decoupleJsonEntries(reconstructedItem);

    result.items.push(reconstructedJsoncWithoutJsonEntries);
    result.value.push(reconstructedItem.value);
    appendJsonEntries(
      result.jsonEntries,
      itemJsonPath.join('.'),
      nestedJsonEntries,
    );

    return result;
  }, initialValue);
};
