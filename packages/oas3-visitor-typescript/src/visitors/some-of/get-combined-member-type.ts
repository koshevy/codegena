import type {
  CombinedTransitiveNode,
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

export interface GetCombinedMemberTypeProps
  extends Pick<VisitorFnProps, 'getAnotherByTransitiveNode'> {

  part: TransitiveNode;
  transitiveNode: CombinedTransitiveNode;
}

export function getCombinedMemberType({
  getAnotherByTransitiveNode,
  part,
  transitiveNode,
}: GetCombinedMemberTypeProps): TypeNode {
  if (part.type === 'reference'
    && !part.mixin
    && (part.ref.name || part.ref.suggestedName)
  ) {
    const namedRefNode = {
      ...part.ref,
      isInline: false,
    };

    const refResult = getAnotherByTransitiveNode(namedRefNode);

    return extractTransitiveNodeIdentifier(
      namedRefNode,
      refResult,
      transitiveNode,
    );
  }

  const result = getAnotherByTransitiveNode({
    ...part,
    isInline: true,
  });

  if (typeof result === 'function') {
    return createFallbackType();
  }

  if (isTypeNode(result.ast)) {
    return result.ast;
  }

  return extractTransitiveNodeIdentifier(part, result, transitiveNode);
}
