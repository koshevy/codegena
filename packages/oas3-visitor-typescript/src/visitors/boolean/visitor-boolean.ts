import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import { createTypescriptTypeAliasVisitorResult } from '../../misc-utils';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';

export const visitorBoolean: TypescriptParserVisitorFn = ({
  logger,
  suggestedName,
  transitiveNode,
}) => {
  if (transitiveNode.type !== 'scalar'
    || transitiveNode.scalarType !== 'boolean'
  ) {
    return null;
  }

  return createTypescriptTypeAliasVisitorResult({
    fallbackNameAspect: 'BooleanType',
    logger,
    suggestedName,
    transitiveNode,
    typeNode: createBooleanType(),
  });
};

function createBooleanType(): TypeNode {
  return factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
}
