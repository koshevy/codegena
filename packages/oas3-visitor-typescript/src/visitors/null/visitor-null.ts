import {
  factory,
  type TypeNode,
} from 'typescript';

import { createTypescriptTypeAliasVisitorResult } from '../../misc-utils';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';

export const visitorNull: TypescriptParserVisitorFn = ({
  logger,
  suggestedName,
  transitiveNode,
}) => {
  if (transitiveNode.type !== 'scalar'
    || transitiveNode.scalarType !== 'null'
  ) {
    return null;
  }

  return createTypescriptTypeAliasVisitorResult({
    fallbackNameAspect: 'NullType',
    logger,
    suggestedName,
    transitiveNode,
    typeNode: createNullType(),
  });
};

function createNullType(): TypeNode {
  return factory.createLiteralTypeNode(factory.createNull());
}
