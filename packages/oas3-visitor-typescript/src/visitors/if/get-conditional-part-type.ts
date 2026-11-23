import type { ConditionalTransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  factory,
  isTypeNode,
  type TypeNode,
} from 'typescript';

import {
  createFallbackType,
  extractTransitiveNodeIdentifier,
} from '../../ast-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

type ConditionalNodePart = (
  | ConditionalTransitiveNode['condition']
  | ConditionalTransitiveNode['mixin']
  | undefined
);

export interface GetConditionalPartTypeProps
  extends Pick<VisitorFnProps, 'getAnotherByTransitiveNode'> {

  fallback: TypeNode;
  part: ConditionalNodePart;
  transitiveNode: ConditionalTransitiveNode;
}

export function getConditionalPartType({
  fallback,
  getAnotherByTransitiveNode,
  part,
  transitiveNode,
}: GetConditionalPartTypeProps): TypeNode {
  if (!part) {
    return fallback;
  }

  if (typeof part === 'string') {
    return factory.createLiteralTypeNode(factory.createStringLiteral(part));
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
