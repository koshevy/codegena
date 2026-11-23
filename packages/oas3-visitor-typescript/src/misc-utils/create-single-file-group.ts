import type {
  UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';
import { factory, type Node as TsNode, type SourceFile } from 'typescript';

import { createAstToString, createGroupSourceFile } from '../ast-utils';
import type { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';
import { collectImmediateGroupedResults } from './collect-immediate-grouped-results';

export function createSingleFileGroup(
  results: TypescriptParserVisitorResult[],
  getFileName: (result: TypescriptParserVisitorResult) => string,
): UltimateParserVisitorResultGroup<SourceFile, TsNode> {
  const groupedItems = collectImmediateGroupedResults(results);
  const firstResult = groupedItems[0];
  const fileName = firstResult ? getFileName(firstResult) : 'types.ts';

  const importAliases = new Map(groupedItems.flatMap((item) => (
    Object.entries(item.importAliases ?? {})
  )));

  const aliases = [...importAliases].map(([name, alias]) => (
    factory.createTypeAliasDeclaration(
      undefined,
      alias,
      undefined,
      factory.createTypeReferenceNode(name),
    )
  ));

  const sourceFile = createGroupSourceFile(fileName, [], groupedItems, aliases);

  return {
    fileName,
    groupedItems,
    relatedGroups: [],
    sourceFile,
    toString: createAstToString(sourceFile, fileName),
  };
}
