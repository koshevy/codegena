import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { posix } from 'pathe';
import type { Node as TsNode } from 'typescript';

import type { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';
import { planOasFilePaths } from './plan-oas-file-paths';
import type { GetCommonDirectoryName } from './resolve-common-oas-directories';
import { resolveGroupedResults } from './resolve-grouped-results';

export interface SeparatedGroupPlan {
  root: TypescriptParserVisitorResult;
  groupedItems: TypescriptParserVisitorResult[];
  fileName: string;
}

interface PendingGroup {
  root: TypescriptParserVisitorResult;
  groupedItems: TypescriptParserVisitorResult[];
}

export async function planSeparatedGroups(
  intermediateResults: TypescriptParserVisitorResult[],
  getFileName: (
    result: TypescriptParserVisitorResult,
    originalFilePath: string,
  ) => string,
  getCommonDirectoryName?: GetCommonDirectoryName,
): Promise<{
  groups: SeparatedGroupPlan[];
  fileNamesByAst: Map<TsNode, string>;
}> {
  const pendingGroups: PendingGroup[] = [];
  const groupByAst = new Map<TsNode, PendingGroup>();

  for (const root of intermediateResults) {
    const resolvedItems = await resolveGroupedResults(root);

    const overlappingGroups = [...new Set(resolvedItems
      .map((item) => groupByAst.get(item.ast))
      .filter((candidateGroup): candidateGroup is PendingGroup => !!candidateGroup))]
      .toSorted((left, right) => (
        pendingGroups.indexOf(left) - pendingGroups.indexOf(right)
      ));

    const firstGroup = overlappingGroups[0];
    const group = firstGroup ?? { root, groupedItems: [] };

    if (!firstGroup) {
      pendingGroups.push(group);
    }

    for (const overlappingGroup of overlappingGroups.slice(1)) {
      for (const item of overlappingGroup.groupedItems) {
        if (groupByAst.get(item.ast) === group) {
          continue;
        }

        group.groupedItems.push(item);
        groupByAst.set(item.ast, group);
      }

      pendingGroups.splice(pendingGroups.indexOf(overlappingGroup), 1);
    }

    for (const item of resolvedItems) {
      if (groupByAst.get(item.ast) === group) {
        continue;
      }

      group.groupedItems.push(item);
      groupByAst.set(item.ast, group);
    }
  }

  const directories = await planOasFilePaths(
    pendingGroups,
    getCommonDirectoryName,
  );
  const fileNamesByAst = new Map<TsNode, string>();

  const preferredPaths = new Map(pendingGroups.map((group) => {
    const { root } = group;
    const fileName = root.transitiveNode.type === 'entrypointRecord'
      ? 'index.ts'
      : root.relativeFilePath;

    return [group, posix.join(directories.get(group) ?? '', fileName)] as const;
  }));

  const pathCounts = preferredPaths.values().reduce((counts, path) => (
    counts.set(path, (counts.get(path) ?? 0) + 1)
  ), new Map<string, number>());

  const entrypointPaths = new Map(pendingGroups.flatMap((group) => {
    const { root } = group;

    if (root.transitiveNode.type !== 'entrypointRecord') {
      return [];
    }

    const preferredPath = preferredPaths.get(group) ?? root.relativeFilePath;
    const hasIndexCollision = (pathCounts.get(preferredPath) ?? 0) > 1;
    const path = hasIndexCollision
      ? posix.join(
          directories.get(group) ?? '',
          posix.parse(root.relativeFilePath).name,
          'index.ts',
        )
      : preferredPath;

    return [[group, path] as const];
  }));

  const groupsByTransitiveNode = new Map<TransitiveNode, PendingGroup>(
    pendingGroups.flatMap((group) => (
      group.groupedItems.map(({ transitiveNode }) => [
        transitiveNode,
        group,
      ] as const)
    )),
  );

  const operationMembers = pendingGroups.flatMap((group) => {
    const node = group.root.transitiveNode;

    if (node.type !== 'entrypointRecord') {
      return [];
    }

    const members = [
      node.pathParameters,
      node.queryParameters,
      node.request,
      node.request?.headers,
      node.response,
      node.response?.headerRecord,
    ];

    return members.flatMap((member) => {
      const memberGroup = member && groupsByTransitiveNode.get(member);

      return memberGroup && memberGroup !== group
        ? [[memberGroup, group] as const]
        : [];
    });
  });

  const ownersByGroup = operationMembers.reduce((owners, [member, operation]) => {
    const operationOwners = owners.get(member) ?? new Set<PendingGroup>();

    operationOwners.add(operation);
    owners.set(member, operationOwners);

    return owners;
  }, new Map<PendingGroup, Set<PendingGroup>>());

  const groups = pendingGroups.map((group) => {
    const { root, groupedItems } = group;
    const operationOwners = ownersByGroup.get(group);
    const operationOwner = operationOwners?.size === 1
      ? [...operationOwners][0]
      : undefined;

    const operationPath = operationOwner
      ? entrypointPaths.get(operationOwner)
      : undefined;

    const directory = operationPath
      ? posix.dirname(operationPath)
      : directories.get(group) ?? '';

    const originalFilePath = entrypointPaths.get(group)
      ?? posix.join(directory, root.relativeFilePath);

    const fileName = getFileName(root, originalFilePath);

    groupedItems.forEach(({ ast }) => {
      fileNamesByAst.set(ast, fileName);
    });

    return { root, groupedItems, fileName };
  });

  return { groups, fileNamesByAst };
}
