import type { ConditionalTransitiveNode } from '@codegena/oas3-core/transitive-node';

import {
  createAstToString,
  createConditionalResultType,
} from '../../ast-utils';
import { programmingLanguageInfo } from '../../programming-language-info';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';
import type { VisitorMicroContext } from '../../visitor-micro-context';

export function addConditionalResultToMicroContext(
  microContext: VisitorMicroContext,
  transitiveNode: ConditionalTransitiveNode,
): void {
  const conditionalResult = createConditionalResult(transitiveNode);

  const isAlreadyGrouped = microContext.shouldBeGroupedWith.some((result) => (
    typeof result !== 'function'
    && result.ast === conditionalResult.ast
  ));

  if (isAlreadyGrouped) {
    return;
  }

  microContext.shouldBeGroupedWith.push(conditionalResult);
}

function createConditionalResult(
  transitiveNode: ConditionalTransitiveNode,
): TypescriptParserVisitorResult {
  const ast = createConditionalResultType();
  const relativeFilePath = 'conditional-result-type.ts';
  const toString = createAstToString(ast, relativeFilePath);

  return {
    ...programmingLanguageInfo,
    ast,
    identifierName: ast.name.text,
    keySnippet: `type ${ast.name.text}`,
    relativeFilePath,
    transitiveNode,
    toString,
  };
}
