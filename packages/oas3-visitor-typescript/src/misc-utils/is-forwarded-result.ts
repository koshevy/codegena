import {
  type AnotherTransitiveNodeParsingResult,
  type UltimateParserVisitorResult,
} from '@codegena/oas3-core/ultimate-parser';
import type {
  Node as TsNode,
} from 'typescript';

export function isForwardedResult(
  dependency: AnotherTransitiveNodeParsingResult<TsNode>,
  result: UltimateParserVisitorResult<TsNode>,
): dependency is UltimateParserVisitorResult<TsNode> {
  return typeof dependency !== 'function'
    && dependency.ast === result.ast
    && dependency.relativeFilePath === result.relativeFilePath;
}
