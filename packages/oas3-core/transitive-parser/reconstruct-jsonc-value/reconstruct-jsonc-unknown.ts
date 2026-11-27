import { defaultLogger } from '@codegena/oas3-core/logger';
import type { Node } from 'jsonc-parser';

import type { ReconstructJsoncFn } from './reconstructed-jsonc-value';
import { JsonParseError } from '../json-parse-error';

export const scalarTypes = [
  'string',
  'number',
  'boolean',
  'null',
];

export const reconstructJsoncUnknown: ReconstructJsoncFn = (
  node: Node,
  sourceFileId,
  getOriginalFileContent: () => string,
  circularFnLinks,
  jsonPath: string[] = [],
  logger = defaultLogger,
  // eslint-disable-next-line max-params
) => {
  if (node.type === 'object') {
    return circularFnLinks.object(
      node,
      sourceFileId,
      getOriginalFileContent,
      circularFnLinks,
      jsonPath,
    );
  }

  if (node.type === 'array') {
    return circularFnLinks.array(
      node,
      sourceFileId,
      getOriginalFileContent,
      circularFnLinks,
      jsonPath,
    );
  }

  if (scalarTypes.includes(node.type)) {
    return {
      getOriginalFileContent,
      jsonPath,
      node,
      sourceFileId,
      value: node.value,
    };
  }

  throw new JsonParseError(
    `Expected scalar type, array or object, but got: ${node.type}`,
    getOriginalFileContent(),
    node,
    { logger, sourceFileId },
  );
};
