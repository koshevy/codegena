import type {
  AnotherTransitiveNodeParsingResult,
  UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';
import type { Node as TsNode, SourceFile } from 'typescript';

type ResultGroup = UltimateParserVisitorResultGroup<SourceFile, TsNode>;
type Dependency = AnotherTransitiveNodeParsingResult<TsNode>;

export async function attachRelatedGroups(groups: ResultGroup[]): Promise<void> {
  const groupByAst = new Map<TsNode, ResultGroup>();

  for (const group of groups) {
    for (const item of group.groupedItems) {
      groupByAst.set(item.ast, group);
    }
  }

  for (const group of groups) {
    const relatedGroups = new Set<ResultGroup>();
    const visitedDependencies = new Set<Dependency>();
    const visitedAstNodes = new Set<TsNode>();

    async function collect(dependency: Dependency): Promise<void> {
      if (visitedDependencies.has(dependency)) {
        return;
      }

      visitedDependencies.add(dependency);

      const resolved = typeof dependency === 'function'
        ? await dependency()
        : dependency;

      if (visitedAstNodes.has(resolved.ast)) {
        return;
      }

      visitedAstNodes.add(resolved.ast);

      const relatedGroup = groupByAst.get(resolved.ast);

      if (relatedGroup && relatedGroup !== group) {
        relatedGroups.add(relatedGroup);
        return;
      }

      if (relatedGroup === group) {
        return;
      }

      const childDependencies = resolved.dependencies ?? [];

      for (const child of childDependencies) {
        await collect(child);
      }
    }

    for (const item of group.groupedItems) {
      const dependencies = item.dependencies ?? [];

      for (const dependency of dependencies) {
        await collect(dependency);
      }
    }

    group.relatedGroups = [...relatedGroups];
  }
}
