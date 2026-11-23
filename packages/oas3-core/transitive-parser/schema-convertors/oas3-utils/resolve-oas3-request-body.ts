import type { Logger } from '@codegena/oas3-core/logger';
import {
  isReferenceObject,
  isRequest,
  type Request,
} from '@codegena/oas3-core/oas3';

import { getLocalReferencePath } from './get-local-reference-path';
import type { ActiveJsoncTree } from '../../active-jsonc-tree';

/**
 * Resolves an operation's local request-body reference and reports unsupported bodies.
 */
export function resolveOas3RequestBody(
  jsoncTree: ActiveJsoncTree,
  logger: Logger,
  operationPath: string[],
  requestBody: unknown,
): { request: Request | null; path: string[] } {
  const referencePath = isReferenceObject(requestBody)
    ? getLocalReferencePath(requestBody.$ref)
    : null;

  const path = referencePath ?? [...operationPath, 'requestBody'];
  const resolvedBody = referencePath
    ? jsoncTree.getData(referencePath)
    : requestBody;

  if (requestBody === undefined) {
    return { request: null, path };
  }

  if (!isRequest(resolvedBody)) {
    logger.warn(
      {
        node: jsoncTree.getNode([...operationPath, 'requestBody']),
        path: [...operationPath, 'requestBody'],
      },
      'Skipped unsupported OpenAPI request body or unresolved request reference.',
    );

    return { request: null, path };
  }

  return { request: resolvedBody, path };
}
