import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import type { TransitiveNode } from '../transitive-node';

export function combineDifferentPropertyValues(
  first: TransitiveNode,
  second: TransitiveNode,
): unknown[] | null {
  const firstValues = first.combinedValueTuple ?? first.rangeOfValues;
  const secondValues = second.combinedValueTuple ?? second.rangeOfValues;

  if (!firstValues?.length || !secondValues?.length) {
    return null;
  }

  const hasSharedValue = firstValues.some((firstValue) => (
    secondValues.some((secondValue) => isEqual(firstValue, secondValue))
  ));

  if (hasSharedValue
    && !first.combinedValueTuple
    && !second.combinedValueTuple
  ) {
    return null;
  }

  return uniqWith([...firstValues, ...secondValues], isEqual);
}
