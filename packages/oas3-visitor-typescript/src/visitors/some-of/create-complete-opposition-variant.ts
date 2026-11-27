import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { subtractTransitiveNode } from '@codegena/oas3-core/transitive-parser';

import { createExclusiveUnionVariant } from './create-exclusive-union-variant';

export function createCompleteOppositionVariant(
  variant: TransitiveNode,
  variants: TransitiveNode[],
): TransitiveNode {
  if (variant.type === 'reference') {
    return variant;
  }

  if (variant.type === 'structure') {
    return createExclusiveUnionVariant(variant, variants);
  }

  return variants.reduce((result, otherVariant) => {
    if (variant === otherVariant || otherVariant.type === 'reference') {
      return result;
    }

    return subtractTransitiveNode(result, otherVariant);
  }, variant);
}
