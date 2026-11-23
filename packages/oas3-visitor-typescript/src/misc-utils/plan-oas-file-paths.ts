import type {
  AnotherTransitiveNodeParsingResult,
} from '@codegena/oas3-core/ultimate-parser';
import kebabCase from 'lodash/kebabCase';
import { posix } from 'pathe';
import type { Node as TsNode } from 'typescript';

import type { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';
import { compactOasDirectories } from './compact-oas-directories';
import type { SeparatedGroupPlan } from './plan-separated-groups';
import {
  type GetCommonDirectoryName,
  resolveCommonOasDirectories,
} from './resolve-common-oas-directories';

type GroupBeforeFileName = Omit<SeparatedGroupPlan, 'fileName'>;

interface OperationScope {
  directory: string;
  tag: string;
}

type Dependency = AnotherTransitiveNodeParsingResult<TsNode>;

function getPathDirectory(path: string): string {
  const segments = path.split('/').filter(Boolean).map((segment) => {
    const parameter = /^\{(.+)\}$/.exec(segment);

    return parameter
      ? `by-${kebabCase(parameter[1])}`
      : kebabCase(segment);
  });

  return segments.join('/') || 'root';
}

function createOperationScope(
  path: string,
  tags?: string[],
  breadcrumbs?: string[],
): OperationScope {
  const tag = kebabCase(tags?.[0] ?? '');
  const nestedParts = breadcrumbs?.length
    ? breadcrumbs.map((item) => kebabCase(item))
    : getPathDirectory(path).split('/');

  const seenWords = new Set(
    (tags?.[0] ?? '').split(/[^A-Za-z0-9]+/)
      .map((part) => part.toLowerCase()),
  );

  const uniqueParts = nestedParts.map((part) => (
    part.split('-').filter((word) => {
      if (seenWords.has(word)) {
        return false;
      }

      seenWords.add(word);

      return true;
    }).join('-')
  )).filter(Boolean);

  const directory = posix.join(
    ...(tag ? [tag] : []),
    ...uniqueParts,
  );

  return { directory, tag };
}

function getOperationScope(
  result: TypescriptParserVisitorResult,
): OperationScope | null {
  const { transitiveNode } = result;

  if (transitiveNode.type !== 'entrypointRecord') {
    return null;
  }

  return createOperationScope(
    transitiveNode.path,
    transitiveNode.tags,
    transitiveNode.breadcrumbs,
  );
}

function getSourceScope(
  result: TypescriptParserVisitorResult,
): OperationScope | null {
  const { jsonPath } = result.transitiveNode.source;
  const path = jsonPath[0] === 'paths' ? jsonPath[1] : undefined;

  if (!path) {
    return null;
  }

  return createOperationScope(
    path,
    result.transitiveNode.tags,
    result.transitiveNode.breadcrumbs,
  );
}

function getSharedDirectory(scopes: OperationScope[]): string {
  const [firstScope] = scopes;

  if (!firstScope) {
    return '';
  }

  const hasOneTag = scopes.every(({ tag }) => (
    tag === firstScope.tag
  ));

  if (!hasOneTag) {
    return '';
  }

  const directorySegments = scopes.map(({ directory: scopeDirectory }) => (
    scopeDirectory.split('/')
  ));

  const firstDirectorySegments = directorySegments[0];
  const differentSegmentIndex = firstDirectorySegments.findIndex((segment, index) => (
    directorySegments.some((segments) => segments[index] !== segment)
  ));

  const sharedSegments = differentSegmentIndex === -1
    ? firstDirectorySegments
    : firstDirectorySegments.slice(0, differentSegmentIndex);

  const directory = sharedSegments.join('/');

  return directory;
}

function isOpenApiResult(result: TypescriptParserVisitorResult): boolean {
  return [
    'openApiDocument',
    'entrypointRecord',
    'requestRecord',
    'responseRecord',
    'responseHeadersRecord',
    'contentTypeRecord',
    'responseContentRecord',
  ].includes(result.transitiveNode.type);
}

export async function planOasFilePaths(
  groups: GroupBeforeFileName[],
  getCommonDirectoryName?: GetCommonDirectoryName,
  maxDepth = 1024,
): Promise<Map<GroupBeforeFileName, string>> {
  const hasOpenApiNodes = groups.some(({ groupedItems }) => (
    groupedItems.some((item) => isOpenApiResult(item))
  ));

  if (!hasOpenApiNodes) {
    return new Map();
  }

  const groupByAst = new Map(groups.flatMap((group) => (
    group.groupedItems.map(({ ast }) => [ast, group] as const)
  )));

  const scopesByGroup = new Map<GroupBeforeFileName, Set<OperationScope>>();

  const entrypoints = groups.flatMap((group) => (
    group.groupedItems.flatMap((item) => {
      const scope = getOperationScope(item);

      return scope ? [{ item, scope }] : [];
    })
  ));

  await Promise.all(entrypoints.map(async ({ item, scope }) => {
    const visited = new Set<TsNode>();

    async function visit(
      result: TypescriptParserVisitorResult,
      depth = 0,
    ): Promise<void> {
      if (visited.has(result.ast)) {
        return;
      }

      if (depth >= maxDepth) {
        throw new RangeError('OpenAPI dependency depth exceeds maxDepth.');
      }

      visited.add(result.ast);

      const group = groupByAst.get(result.ast);

      if (group) {
        const groupScopes = scopesByGroup.get(group) ?? new Set<OperationScope>();

        groupScopes.add(scope);
        scopesByGroup.set(group, groupScopes);
      }

      const dependencies = await Promise.all(
        (result.dependencies ?? []).map((dependency) => (
          resolveDependency(dependency)
        )),
      );

      await Promise.all(dependencies.map((dependency) => {
        if (depth + 1 >= maxDepth && !visited.has(dependency.ast)) {
          throw new RangeError('OpenAPI dependency depth exceeds maxDepth.');
        }

        return visit(dependency, depth + 1);
      }));
    }

    await visit(item);
  }));

  const placementByGroup = new Map(groups.map((group) => {
    const isDocument = group.groupedItems.some(({ transitiveNode }) => (
      transitiveNode.type === 'openApiDocument'
    ));

    if (isDocument) {
      return [group, { directory: '', isCommon: false }] as const;
    }

    const scopes = [...(scopesByGroup.get(group) ?? [])];
    const hasOasNode = group.groupedItems.some((item) => isOpenApiResult(item));

    if (hasOasNode && !scopes.length) {
      const sourceScope = group.groupedItems
        .filter((item) => isOpenApiResult(item))
        .map((item) => getSourceScope(item))
        .find((scope): scope is OperationScope => !!scope);

      return [group, {
        directory: sourceScope?.directory ?? '',
        isCommon: !sourceScope,
      }] as const;
    }

    const directory = getSharedDirectory(scopes);
    const isCommon = scopes.length > 1;

    return [group, { directory, isCommon }] as const;
  }));

  const directoriesByGroup = new Map([...placementByGroup].map(([
    group,
    { directory },
  ]) => [group, directory] as const));

  const commonGroups = new Set([...placementByGroup].flatMap(([
    group,
    { isCommon },
  ]) => (isCommon ? [group] : [])));

  const compactedDirectories = compactOasDirectories(directoriesByGroup);
  const resolvedDirectories = resolveCommonOasDirectories(
    compactedDirectories,
    commonGroups,
    getCommonDirectoryName,
  );

  return compactOasDirectories(resolvedDirectories);
}

async function resolveDependency(
  dependency: Dependency,
): Promise<TypescriptParserVisitorResult> {
  return typeof dependency === 'function' ? dependency() : dependency;
}
