import { isDeclarationStatement, type Node as TsNode } from 'typescript';

import type { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';

export function collectImmediateGroupedResults(
  parsedResults: TypescriptParserVisitorResult[],
): TypescriptParserVisitorResult[] {
  const groupedItems: TypescriptParserVisitorResult[] = [];
  const pendingItems = [...parsedResults];
  const includedAstNodes = new Set<TsNode>();
  let index = 0;

  while (index < pendingItems.length) {
    const item = pendingItems[index];

    index += 1;
    if (includedAstNodes.has(item.ast)) {
      continue;
    }

    includedAstNodes.add(item.ast);

    if (isDeclarationStatement(item.ast)) {
      groupedItems.push(item);
    }

    const dependencies = [
      ...(item.shouldBeGroupedWith ?? []),
      ...(item.dependencies ?? []),
    ];

    for (const dependency of dependencies) {
      if (typeof dependency !== 'function') {
        pendingItems.push(dependency);
      }
    }
  }

  return groupedItems;
}
