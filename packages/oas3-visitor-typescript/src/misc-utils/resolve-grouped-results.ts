import type { Node as TsNode } from 'typescript';

import type { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';

export async function resolveGroupedResults(
  intermediateResult: TypescriptParserVisitorResult,
): Promise<TypescriptParserVisitorResult[]> {
  const groupedItems = [intermediateResult];
  const includedAstNodes = new Set<TsNode>([intermediateResult.ast]);
  let index = 0;

  while (index < groupedItems.length) {
    const item = groupedItems[index];
    const groupedDependencies = item.shouldBeGroupedWith ?? [];

    index += 1;

    for (const groupedDependency of groupedDependencies) {
      const resolved = typeof groupedDependency === 'function'
        ? await groupedDependency()
        : groupedDependency;

      if (includedAstNodes.has(resolved.ast)) {
        continue;
      }

      includedAstNodes.add(resolved.ast);
      groupedItems.push(resolved);
    }
  }

  return groupedItems;
}
