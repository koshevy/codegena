import type {
  TransitiveNode,
  UnionTransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import {
  isMinuendCoveredBySubtrahend,
} from '@codegena/oas3-core/transitive-parser';

export function filterExcludedUnionVariants(
  variants: TransitiveNode[],
  transitiveNode: UnionTransitiveNode,
): TransitiveNode[] {
  const exclusions = transitiveNode.not ?? [];

  if (!exclusions.length) {
    return variants;
  }

  return variants.filter((variant) => exclusions.every((excluded) => (
    !isMinuendCoveredBySubtrahend(variant, excluded)
  )));
}
