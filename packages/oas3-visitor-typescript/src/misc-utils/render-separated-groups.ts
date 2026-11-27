import type {
  UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';
import type { Node as TsNode, SourceFile, Statement } from 'typescript';

import { attachRelatedGroups } from './attach-related-groups';
import type { SeparatedGroupPlan } from './plan-separated-groups';
import {
  createBarrelSourceFile,
  createDocumentSourceFile,
  planTypeBarrels,
} from './separated-oas-barrels';
import { createAstToString, createGroupSourceFile } from '../ast-utils';
import type { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';

type RenderedGroup = UltimateParserVisitorResultGroup<SourceFile, TsNode>;

export async function renderSeparatedGroups(
  groups: SeparatedGroupPlan[],
  renderImports: (
    result: TypescriptParserVisitorResult,
    owner: TypescriptParserVisitorResult,
  ) => Promise<Statement[]>,
): Promise<RenderedGroup[]> {
  const document = groups.find(({ root }) => (
    root.transitiveNode.type === 'openApiDocument'
  ));
  const barrels = document ? planTypeBarrels(groups, document.fileName) : [];
  const barrelsByFile = new Map(barrels.flatMap((barrel) => (
    (barrel.operationFiles.length ? barrel.operationFiles : [barrel.fileName])
      .map((fileName) => [fileName, barrel] as const)
  )));
  const barreledSources = new Set(barrels.flatMap(({ sourceGroups }) => sourceGroups));
  const directSources = document
    ? groups.filter((group) => (
        group !== document
        && !barrelsByFile.has(group.fileName)
        && !barreledSources.has(group)
      ))
    : [];
  const documentSources = [
    ...barrels.filter(({ sourceGroups }) => sourceGroups.length),
    ...directSources.map((group) => ({
      fileName: group.fileName,
      sourceGroups: [group],
    })),
  ];
  const renderedGroups: RenderedGroup[] = await Promise.all(groups.map(async (plan) => {
    const { root, groupedItems, fileName } = plan;
    const barrel = barrelsByFile.get(fileName);
    let sourceFile: SourceFile;

    if (plan === document) {
      sourceFile = createDocumentSourceFile(plan, documentSources);
    }
    else if (barrel) {
      sourceFile = createBarrelSourceFile(barrel, fileName);
    }
    else {
      const combinedResult: TypescriptParserVisitorResult = {
        ...root,
        dependencies: [
          ...groupedItems.flatMap((item) => item.dependencies ?? []),
        ],
        shouldBeGroupedWith: groupedItems,
        importAliases: Object.assign(
          {},
          ...groupedItems.map((item) => item.importAliases ?? {}),
        ),
      };

      const imports = await renderImports(combinedResult, root);

      sourceFile = createGroupSourceFile(fileName, imports, groupedItems);
    }

    return {
      fileName,
      groupedItems,
      sourceFile,
      toString: createAstToString(sourceFile, fileName),
    };
  }));

  const renderedNames = new Set(renderedGroups.map(({ fileName }) => fileName));
  const newBarrels = barrels.filter(({ fileName }) => !renderedNames.has(fileName));

  renderedGroups.push(...newBarrels.map((barrel) => {
    const sourceFile = createBarrelSourceFile(barrel);

    return {
      fileName: barrel.fileName,
      groupedItems: [],
      sourceFile,
      toString: createAstToString(sourceFile, barrel.fileName),
    };
  }));

  await attachRelatedGroups(renderedGroups);

  const renderedByFile = new Map(renderedGroups.map((group) => [group.fileName, group]));

  for (const group of renderedGroups) {
    const barrel = barrelsByFile.get(group.fileName);
    const sources = group.fileName === document?.fileName
      ? documentSources
      : barrel?.sourceGroups;

    if (sources) {
      group.relatedGroups = sources.flatMap(({ fileName }) => (
        renderedByFile.get(fileName) ?? []
      ));
    }
  }

  return renderedGroups;
}
