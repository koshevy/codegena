import type { Logger } from '@codegena/oas3-core/logger';
import {
  isOperation,
  isParameter,
  isReferenceObject,
  type Parameter,
} from '@codegena/oas3-core/oas3';

import { getLocalReferencePath } from './get-local-reference-path';
import type { ActiveJsoncTree } from '../../active-jsonc-tree';

export interface ParameterAtPath {
  parameter: Parameter;
  path: string[];
}

/**
 * Prefers a parameter schema over the first media-content schema.
 */
export function getOas3ParameterSchemaPath({
  parameter,
  path,
}: ParameterAtPath): string[] | null {
  if (parameter.schema !== undefined) {
    return [...path, 'schema'];
  }

  const content = Object.entries(parameter.content ?? {})[0];

  return content?.[1].schema !== undefined
    ? [...path, 'content', content[0], 'schema']
    : null;
}

/**
 * Applies operation-level overrides to path-level parameters by name and target.
 */
export function getOas3OperationParameters(
  jsoncTree: ActiveJsoncTree,
  logger: Logger,
  operationPath: string[],
): ParameterAtPath[] {
  const pathItemPath = operationPath.slice(0, 2);
  const pathItem = jsoncTree.getData(pathItemPath);
  const operation = jsoncTree.getData(operationPath);
  const pathParameters = typeof pathItem === 'object'
    && pathItem !== null
    && 'parameters' in pathItem
    && Array.isArray(pathItem.parameters)
    ? pathItem.parameters
    : [];

  const operationParameters = isOperation(operation)
    ? operation.parameters ?? []
    : [];

  const entries = [
    ...pathParameters.map((parameter, index) => ({
      parameter,
      path: [...pathItemPath, 'parameters', String(index)],
    })),
    ...operationParameters.map((parameter, index) => ({
      parameter,
      path: [...operationPath, 'parameters', String(index)],
    })),
  ];

  const resolved = entries.flatMap(({ parameter, path }) => {
    const referencePath = isReferenceObject(parameter)
      ? getLocalReferencePath(parameter.$ref)
      : null;

    const value = referencePath
      ? jsoncTree.getData(referencePath)
      : parameter;

    if (!isParameter(value)) {
      logger.warn(
        { node: jsoncTree.getNode(path), path },
        'Skipped unsupported OpenAPI parameter or unresolved parameter reference.',
      );

      return [];
    }

    return [{ parameter: value, path: referencePath ?? path }];
  });

  const latestByIdentity = new Map(
    resolved.map((entry) => [
      `${entry.parameter.in}:${entry.parameter.name}`,
      entry,
    ] as const),
  );

  return [...latestByIdentity.values()];
}
