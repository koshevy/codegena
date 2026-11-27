import type { ArrayTransitiveNode } from '@codegena/oas3-core/transitive-node';
import { factory, SyntaxKind, type TypeNode } from 'typescript';

import { createArrayTypeNode } from './create-array-type-node';
import {
  createBoundedPrefixedTupleType,
} from './create-bounded-prefixed-tuple-type';
import { getArrayItemType } from './get-array-item-type';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

interface CreateLengthConstrainedTupleTypeProps extends Pick<
  VisitorFnProps,
  'getAnotherByTransitiveNode' | 'options'
> {
  transitiveNode: ArrayTransitiveNode;
}

export function createLengthConstrainedTupleType({
  getAnotherByTransitiveNode,
  options,
  transitiveNode,
}: CreateLengthConstrainedTupleTypeProps): TypeNode | null {
  const { maxLength, minLength } = transitiveNode;
  const minThreshold = options?.minLengthTupleThreshold ?? 20;
  const maxThreshold = options?.maxLengthTupleThreshold ?? 10;

  const isUseMinLength = minThreshold > 0
    && minLength !== undefined
    && Number.isSafeInteger(minLength)
    && minLength >= 0
    && minLength < minThreshold;

  const isUseMaxLength = maxThreshold > 0
    && maxLength !== undefined
    && Number.isSafeInteger(maxLength)
    && maxLength >= 0
    && maxLength < maxThreshold;

  if (maxLength !== undefined
    && isUseMaxLength
    && transitiveNode.itemsTuple
  ) {
    return createBoundedPrefixedTupleType({
      getAnotherByTransitiveNode,
      itemsTuple: transitiveNode.itemsTuple,
      maxLength,
      minLength: isUseMinLength ? minLength : undefined,
      transitiveNode,
    });
  }

  if (transitiveNode.itemsTuple) {
    return null;
  }

  if (!isUseMinLength && !isUseMaxLength) {
    return null;
  }

  const itemNode = transitiveNode.itemsInCommon
    ?? transitiveNode.restItemsInTuple;

  const itemType = itemNode
    ? getArrayItemType({ getAnotherByTransitiveNode, item: itemNode, transitiveNode })
    : factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);

  if (isUseMaxLength && maxLength !== undefined) {
    const firstLength = isUseMinLength && minLength !== undefined
      ? minLength
      : 0;

    if (firstLength > maxLength) {
      return factory.createKeywordTypeNode(SyntaxKind.NeverKeyword);
    }

    const tuples = Array.from(
      { length: maxLength - firstLength + 1 },
      (_, index) => factory.createTupleTypeNode(
        Array.from({ length: firstLength + index }, () => itemType),
      ),
    );

    return tuples.length === 1
      ? tuples[0]
      : factory.createUnionTypeNode(tuples);
  }

  if (!isUseMinLength || minLength === undefined) {
    return null;
  }

  if (minLength === 0) {
    return createArrayTypeNode(itemType);
  }

  const restNode = transitiveNode.restItemsInTuple
    ?? transitiveNode.itemsInCommon;

  const restType = restNode && restNode !== itemNode
    ? getArrayItemType({
        getAnotherByTransitiveNode,
        item: restNode,
        transitiveNode,
      })
    : itemType;

  return factory.createTupleTypeNode([
    ...Array.from({ length: minLength }, () => itemType),
    factory.createRestTypeNode(createArrayTypeNode(restType)),
  ]);
}
