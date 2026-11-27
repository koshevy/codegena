import {
  factory,
  type TypeNode,
} from 'typescript';

import {
  createFallbackType,
  deserializeJsonValueToTypeNode,
} from '../../ast-utils';
import {
  createTypescriptTypeAliasVisitorResult,
} from '../../misc-utils';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';

export const visitorRangeOfValues: TypescriptParserVisitorFn = ({
  logger,
  suggestedName,
  transitiveNode,
}) => {
  const { combinedValueTuple, rangeOfValues } = transitiveNode;

  let typeNode: TypeNode | null = null;

  if (combinedValueTuple?.length) {
    typeNode = factory.createTupleTypeNode(
      combinedValueTuple.map((item) => createRangeValueType(item)),
    );
  }
  else if (rangeOfValues?.length) {
    typeNode = createRangeOfValuesType(rangeOfValues);
  }

  if (!typeNode) {
    return null;
  }

  return createTypescriptTypeAliasVisitorResult({
    fallbackNameAspect: 'RangeOfValuesType',
    logger,
    suggestedName,
    transitiveNode,
    typeNode,
  });
};

function createRangeOfValuesType(rangeOfValues: unknown[]): TypeNode {
  const literalTypes = rangeOfValues.map((item) => createRangeValueType(item));

  if (literalTypes.length === 1) {
    return literalTypes[0];
  }

  return factory.createUnionTypeNode(literalTypes);
}

function createRangeValueType(value: unknown): TypeNode {
  return deserializeJsonValueToTypeNode(value) ?? createFallbackType();
}
