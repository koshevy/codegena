import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import type { UltimateParserVisitorResult } from '@codegena/oas3-core/ultimate-parser';
import kebabCase from 'lodash/kebabCase';
import type { Node as TsNode } from 'typescript';

import {
  createAstToString,
  createFallbackType,
  createTypeAliasDeclaration,
  getDeclarationKeySnippet,
  getTypeScriptDeclarationType,
} from '../ast-utils';
import { programmingLanguageInfo } from '../programming-language-info';
import { createTypeIdentifierName } from './create-type-identifier-name';

export function createFallbackVisitorResult(
  transitiveNode: TransitiveNode,
): UltimateParserVisitorResult<TsNode> {
  const fallbackType = createFallbackType();
  let ast: TsNode = fallbackType;
  let identifierName: string | undefined;
  let relativeFilePath = 'unknown.ts';

  if (!transitiveNode.isInline
    && (transitiveNode.name || transitiveNode.suggestedName)
  ) {
    identifierName = createTypeIdentifierName({
      name: transitiveNode.name,
      suggestedName: transitiveNode.suggestedName,
      fallbackNameAspect: 'UnknownType',
    });

    ast = createTypeAliasDeclaration(identifierName, fallbackType);
    relativeFilePath = `${kebabCase(identifierName)}.ts`;
  }

  return {
    ...programmingLanguageInfo,
    ast,
    declarationType: getTypeScriptDeclarationType(ast),
    dependencies: [],
    identifierName,
    keySnippet: getDeclarationKeySnippet(ast, transitiveNode.isInline),
    relativeFilePath,
    shouldBeGroupedWith: [],
    transitiveNode,
    toString: createAstToString(ast, relativeFilePath, transitiveNode),
  };
}
