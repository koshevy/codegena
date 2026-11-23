import type {
  ArrayTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import {
  isTypeNode,
  type TypeNode,
} from 'typescript';

import {
  createFallbackType,
  extractTransitiveNodeIdentifier,
} from '../../ast-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

export interface GetArrayItemTypeProps
  extends Pick<VisitorFnProps, 'getAnotherByTransitiveNode'> {

  item: TransitiveNode;
  transitiveNode: ArrayTransitiveNode;
}

export function getArrayItemType({
  getAnotherByTransitiveNode,
  item,
  transitiveNode,
}: GetArrayItemTypeProps): TypeNode {
  const result = getAnotherByTransitiveNode({
    ...item,
    isInline: true,
  });

  if (typeof result === 'function') {
    return createFallbackType();
  }

  if (isTypeNode(result.ast)) {
    return result.ast;
  }

  return extractTransitiveNodeIdentifier(item, result, transitiveNode);
}
