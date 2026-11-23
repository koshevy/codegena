import { defaultLogger } from '@codegena/oas3-core/logger';

import { appendJsonEntries } from './append-json-entries';
import { decoupleJsonEntries } from './decouple-json-entries';
import type {
  ReconstructJsoncFn,
  ReconstructedJsoncValue,
} from './reconstructed-jsonc-value';
import { JsonParseError } from '../json-parse-error';

export const reconstructJsoncObject: ReconstructJsoncFn = (
  node,
  sourceFileId,
  getOriginalFileContent,
  circularFnLinks,
  jsonPath,
  logger = defaultLogger,
  // eslint-disable-next-line max-params
) => {
  if (node.type !== 'object') {
    throw new JsonParseError(
      'Node should be an object',
      getOriginalFileContent(),
      node,
      { sourceFileId },
    );
  }

  const reconstructedEntries = node.children?.reduce((result, propertyNode) => {
    const { children } = propertyNode;

    if (children?.length !== 2) {
      throw new JsonParseError(
        'Expected object property',
        getOriginalFileContent(),
        propertyNode,
        { logger, sourceFileId },
      );
    }

    const [propertyNameNode, propertyValueNode] = children;

    if (propertyNameNode.type !== 'string'
      || typeof propertyNameNode.value !== 'string'
    ) {
      throw new JsonParseError(
        'Expected object property name',
        getOriginalFileContent(),
        propertyNode,
        { sourceFileId },
      );
    }

    const propertyName = propertyNameNode.value;
    const propertyPath = [...jsonPath, propertyName];
    const reconstructedPropertyValue = circularFnLinks.unknown(
      propertyValueNode,
      sourceFileId,
      getOriginalFileContent,
      circularFnLinks,
      propertyPath,
    );

    /**
     * The `jsonEntries` property is usable only at root level.
     * Duplicating at nested level creates significant memory overhead.
     */
    const {
      jsonEntries: nestedJsonEntries,
      reconstructedJsoncWithoutJsonEntries,
    } = decoupleJsonEntries(reconstructedPropertyValue);

    result.properties.set(propertyName, reconstructedJsoncWithoutJsonEntries);
    result.value.set(propertyName, reconstructedPropertyValue.value);
    appendJsonEntries(
      result.jsonEntries,
      propertyPath.join('.'),
      nestedJsonEntries,
    );

    return result;
  }, {
    jsonEntries: [],
    properties: new Map<string, ReconstructedJsoncValue>(),
    value: new Map<string, unknown>(),
  });

  if (!reconstructedEntries) {
    throw new JsonParseError(
      'Expected object property but got unkown value',
      getOriginalFileContent(),
      node,
      { sourceFileId },
    );
  }

  return {
    getOriginalFileContent,
    jsonEntries: reconstructedEntries.jsonEntries,
    jsonPath: [...jsonPath],
    node,
    properties: Object.fromEntries(reconstructedEntries.properties),
    sourceFileId,
    value: Object.fromEntries(reconstructedEntries.value),
  };
};
