import type { ArrayTransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import { createArrayTypeNode } from './create-array-type-node';
import {
  createLengthConstrainedTupleType,
} from './create-length-constrained-tuple-type';
import { getArrayItemType } from './get-array-item-type';
import { createTypescriptTypeAliasVisitorResult } from '../../misc-utils';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';

export const visitorArray: TypescriptParserVisitorFn = ({
  getAnotherByTransitiveNode,
  logger,
  options,
  suggestedName,
  transitiveNode,
}) => {
  if (transitiveNode.type !== 'array') {
    return null;
  }

  return createTypescriptTypeAliasVisitorResult({
    fallbackNameAspect: 'ArrayType',
    logger,
    suggestedName,
    transitiveNode,
    typeNode: createArrayType(
      transitiveNode,
      getAnotherByTransitiveNode,
      options,
    ),
  });
};

function createArrayType(
  transitiveNode: ArrayTransitiveNode,
  getAnotherByTransitiveNode: Parameters<
    TypescriptParserVisitorFn
  >[0]['getAnotherByTransitiveNode'],
  options: Parameters<TypescriptParserVisitorFn>[0]['options'],
): TypeNode {
  const lengthConstrainedType = createLengthConstrainedTupleType({
    getAnotherByTransitiveNode,
    options,
    transitiveNode,
  });

  if (lengthConstrainedType) {
    return lengthConstrainedType;
  }

  const commonItemsType = createCommonItemsType(
    transitiveNode,
    getAnotherByTransitiveNode,
  );

  const tupleItemsType = createTupleItemsType(
    transitiveNode,
    getAnotherByTransitiveNode,
  );

  if (commonItemsType && tupleItemsType) {
    return factory.createUnionTypeNode([
      commonItemsType,
      tupleItemsType,
    ]);
  }

  if (commonItemsType) {
    return commonItemsType;
  }

  if (tupleItemsType) {
    return tupleItemsType;
  }

  return factory.createArrayTypeNode(
    factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
  );
}

function createCommonItemsType(
  transitiveNode: ArrayTransitiveNode,
  getAnotherByTransitiveNode: Parameters<
    TypescriptParserVisitorFn
  >[0]['getAnotherByTransitiveNode'],
): TypeNode | null {
  if (!transitiveNode.itemsInCommon) {
    return null;
  }

  const itemType = getArrayItemType({
    getAnotherByTransitiveNode,
    item: transitiveNode.itemsInCommon,
    transitiveNode,
  });

  return createArrayTypeNode(itemType);
}

function createTupleItemsType(
  transitiveNode: ArrayTransitiveNode,
  getAnotherByTransitiveNode: Parameters<
    TypescriptParserVisitorFn
  >[0]['getAnotherByTransitiveNode'],
): TypeNode | null {
  if (!transitiveNode.itemsTuple) {
    return null;
  }

  const tupleItems = transitiveNode.itemsTuple.map((item) => (
    getArrayItemType({
      getAnotherByTransitiveNode,
      item,
      transitiveNode,
    })
  ));

  const restItem = transitiveNode.restItemsInTuple
    ? getArrayItemType({
        getAnotherByTransitiveNode,
        item: transitiveNode.restItemsInTuple,
        transitiveNode,
      })
    : null;

  if (restItem) {
    tupleItems.push(factory.createRestTypeNode(createArrayTypeNode(restItem)));
  }

  return factory.createTupleTypeNode(tupleItems);
}
