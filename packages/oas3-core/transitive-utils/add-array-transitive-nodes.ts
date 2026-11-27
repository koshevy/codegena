import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import {
  areMainNodeTypesEqual,
  hasSignificantNodeDifference,
} from './has-significant-node-difference';
import { intersectRangeOfValues } from './intersect-range-of-values';
import type {
  ArrayTransitiveNode,
  TransitiveNode,
} from '../transitive-node';

/** Combines array item schemas, tuple prefixes, and length constraints. */
export function addArrayTransitiveNodes(
  first: ArrayTransitiveNode,
  second: ArrayTransitiveNode,
  addItems: (
    firstItem: TransitiveNode,
    secondItem: TransitiveNode,
  ) => TransitiveNode,
): ArrayTransitiveNode {
  const minLength = combineLengthBounds(
    first.minLength,
    second.minLength,
    Math.max,
  );

  const maxLength = combineLengthBounds(
    first.maxLength,
    second.maxLength,
    Math.min,
  );

  const commonItems = combineOptionalItems(
    first.itemsInCommon,
    second.itemsInCommon,
    addItems,
  );

  let itemsTuple = combineTupleItems(
    first.itemsTuple,
    second.itemsTuple,
    addItems,
  );

  let restItemsInTuple = combineOptionalItems(
    first.restItemsInTuple,
    second.restItemsInTuple,
    addItems,
  );

  if (itemsTuple) {
    restItemsInTuple = combineOptionalItems(
      restItemsInTuple,
      commonItems,
      addItems,
    );
  }

  const concreteRestItem = restItemsInTuple;

  if (itemsTuple && concreteRestItem && !concreteRestItem.isFallbackType) {
    itemsTuple = itemsTuple.map((item) => (
      item.type === 'unknown' && item.isFallbackType
        ? concreteRestItem
        : item
    ));
  }

  if (itemsTuple
    && minLength !== undefined
    && minLength > itemsTuple.length
  ) {
    const restItem: TransitiveNode = restItemsInTuple ?? {
      isFallbackType: true,
      source: first.source,
      type: 'unknown',
    };

    restItemsInTuple = restItem;
    itemsTuple = [
      ...itemsTuple,
      ...Array.from(
        { length: minLength - itemsTuple.length },
        () => restItem,
      ),
    ];
  }

  const itemsInCommon = itemsTuple ? undefined : commonItems;
  const rangeOfValues = intersectRangeOfValues(first, second);
  const nestedTransitiveNodes = [
    ...(itemsTuple ?? []),
    ...(itemsInCommon ? [itemsInCommon] : []),
    ...(restItemsInTuple ? [restItemsInTuple] : []),
  ];

  return {
    ...first,
    isFallbackType: first.isFallbackType && second.isFallbackType,
    itemsInCommon,
    itemsTuple,
    maxLength,
    minLength,
    nestedTransitiveNodes,
    rangeOfValues,
    restItemsInTuple,
    isNever: first.isNever
      || second.isNever
      || rangeOfValues?.length === 0
      || (
        minLength !== undefined
        && maxLength !== undefined
        && minLength > maxLength
      ),
  };
}

function combineLengthBounds(
  first: number | undefined,
  second: number | undefined,
  combine: (first: number, second: number) => number,
): number | undefined {
  if (first === undefined) {
    return second;
  }

  if (second === undefined) {
    return first;
  }

  return combine(first, second);
}

function combineOptionalItems(
  first: TransitiveNode | undefined,
  second: TransitiveNode | undefined,
  addItems: (
    firstItem: TransitiveNode,
    secondItem: TransitiveNode,
  ) => TransitiveNode,
): TransitiveNode | undefined {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return addArrayItems(first, second, addItems);
}

function combineTupleItems(
  first: TransitiveNode[] | undefined,
  second: TransitiveNode[] | undefined,
  addItems: (
    firstItem: TransitiveNode,
    secondItem: TransitiveNode,
  ) => TransitiveNode,
): TransitiveNode[] | undefined {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return Array.from(
    { length: Math.max(first.length, second.length) },
    (_, index) => combineOptionalItems(first[index], second[index], addItems),
  ).filter((item): item is TransitiveNode => !!item);
}

function addArrayItems(
  first: TransitiveNode,
  second: TransitiveNode,
  addItems: (
    firstItem: TransitiveNode,
    secondItem: TransitiveNode,
  ) => TransitiveNode,
): TransitiveNode {
  if (first.rangeOfValues?.length && second.rangeOfValues?.length) {
    const rangeOfValues = uniqWith(
      [
        ...expandArrayItemValues(first),
        ...expandArrayItemValues(second),
      ],
      isEqual,
    );

    return {
      ...first,
      combinedValueTuple: undefined,
      rangeOfValues,
    };
  }

  if (first.isFallbackType && !second.isFallbackType) {
    return second;
  }

  if (second.isFallbackType && !first.isFallbackType) {
    return first;
  }

  if (areMainNodeTypesEqual(first, second)
    && (first.type === 'structure' || first.type === 'array')
  ) {
    const combinedItems = addItems(first, second);

    if (!combinedItems.isNever) {
      return combinedItems;
    }
  }

  if (!hasSignificantNodeDifference(first, second)) {
    return first;
  }

  return {
    mixin: null,
    referredTransitiveNodes: [first, second],
    source: first.source,
    type: 'union',
  };
}

function expandArrayItemValues(node: TransitiveNode): unknown[] {
  const values = node.rangeOfValues ?? [];

  if (node.type !== 'array' || !node.isFallbackType) {
    return values;
  }

  // Expand fallback array literals when combining candidate item values.
  return values.flatMap((value) => Array.isArray(value) ? value : [value]);
}
