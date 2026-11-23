import isEqual from 'lodash/isEqual';

import type { TransitiveNode } from '../transitive-node';

export function intersectRangeOfValues(
  first: TransitiveNode,
  second: TransitiveNode,
): unknown[] | undefined {
  if (!first.rangeOfValues) {
    return second.rangeOfValues;
  }

  if (!second.rangeOfValues) {
    return first.rangeOfValues;
  }

  return first.rangeOfValues.filter((firstValue) => (
    second.rangeOfValues?.some((secondValue) => (
      isEqual(firstValue, secondValue)
    ))
  ));
}
