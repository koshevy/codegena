import type {
  ArrayTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import { factory, SyntaxKind, type TypeNode } from 'typescript';

import { getArrayItemType } from './get-array-item-type';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

interface CreateBoundedPrefixedTupleTypeProps extends Pick<
  VisitorFnProps,
  'getAnotherByTransitiveNode'
> {
  itemsTuple: TransitiveNode[];
  maxLength: number;
  minLength?: number;
  transitiveNode: ArrayTransitiveNode;
}

export function createBoundedPrefixedTupleType({
  getAnotherByTransitiveNode,
  itemsTuple,
  maxLength,
  minLength,
  transitiveNode,
}: CreateBoundedPrefixedTupleTypeProps): TypeNode {
  const firstLength = minLength ?? 0;

  if (firstLength > maxLength) {
    return factory.createKeywordTypeNode(SyntaxKind.NeverKeyword);
  }

  const prefixTypes = itemsTuple.map((item) => getArrayItemType({
    getAnotherByTransitiveNode,
    item,
    transitiveNode,
  }));

  const restItem = transitiveNode.restItemsInTuple;
  const restType = restItem
    ? getArrayItemType({
        getAnotherByTransitiveNode,
        item: restItem,
        transitiveNode,
      })
    : factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);

  const tuples = Array.from(
    { length: maxLength - firstLength + 1 },
    (_tuple, index) => factory.createTupleTypeNode(
      Array.from(
        { length: firstLength + index },
        (_item, itemIndex) => prefixTypes[itemIndex] ?? restType,
      ),
    ),
  );

  return tuples.length === 1
    ? tuples[0]
    : factory.createUnionTypeNode(tuples);
}
