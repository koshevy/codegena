import { intersectRangeOfValues } from './intersect-range-of-values';
import type { TransitiveNode } from '../transitive-node';

export function createTransitiveNodeWithAddedRange(
  first: TransitiveNode,
  second: TransitiveNode,
): TransitiveNode {
  const rangeOfValues = intersectRangeOfValues(first, second);

  return {
    ...first,
    isNever: first.isNever
      || second.isNever
      || rangeOfValues?.length === 0,
    rangeOfValues,
  };
}
