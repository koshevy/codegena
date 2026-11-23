import { addArrayTransitiveNodes } from './add-array-transitive-nodes';
import { combineDifferentPropertyValues } from './combine-different-property-values';
import {
  createTransitiveNodeWithAddedRange,
} from './create-transitive-node-with-added-range';
import {
  areMainNodeTypesEqual,
  hasSignificantNodeDifference,
} from './has-significant-node-difference';
import { intersectRangeOfValues } from './intersect-range-of-values';
import {
  mergeStructureAdditionalProperties,
} from './merge-structure-additional-properties';
import { mergeStructurePatterns } from './merge-structure-patterns';
import type {
  StructureTransitiveNode,
  TransitiveNode,
} from '../transitive-node';

/**
 * Combines constraints from two transitive nodes. Shared value ranges are
 * narrowed to their overlap, compatible structures merge their properties,
 * and incompatible top-level constraints produce a `never` node. Merged
 * properties inherit requiredness, prefer concrete nodes over fallbacks, and
 * combine differing or referenced types into a union.
 */
export function doAdditionOfTransitiveNodes(
  first: TransitiveNode,
  second: TransitiveNode,
): TransitiveNode {
  if (first.isNever) {
    return first;
  }

  if (second.isNever) {
    return second;
  }

  if (first.type === 'union' || second.type === 'union') {
    return addUnionTransitiveNodes(first, second);
  }

  if (!areMainNodeTypesEqual(first, second)) {
    return createNeverTransitiveNode(first);
  }

  if (first.type === 'structure' && second.type === 'structure') {
    return addStructureTransitiveNodes(first, second);
  }

  if (first.type === 'array' && second.type === 'array') {
    return addArrayTransitiveNodes(
      first,
      second,
      doAdditionOfTransitiveNodes,
    );
  }

  if (first.type === 'unknown' && second.type === 'unknown'
    && (first.rangeOfValues || second.rangeOfValues)
  ) {
    return createTransitiveNodeWithAddedRange(first, second);
  }

  if (hasSignificantNodeDifference(
    first,
    second,
    { ignoreRangeOfValues: true },
  )) {
    return createNeverTransitiveNode(first);
  }

  return createTransitiveNodeWithAddedRange(first, second);
}

function addStructureTransitiveNodes(
  first: StructureTransitiveNode,
  second: StructureTransitiveNode,
): StructureTransitiveNode {
  const propertiesByName = Object.entries(second.properties ?? {}).reduce(
    (result, [propertyName, secondProperty]) => {
      const firstProperty = result.get(propertyName);

      result.set(propertyName, firstProperty
        ? addStructureProperty(firstProperty, secondProperty)
        : secondProperty);

      return result;
    },
    new Map<string, TransitiveNode>(Object.entries(first.properties ?? {})),
  );

  const rangeOfValues = intersectRangeOfValues(first, second);

  const { defaultKeyPattern, propertyPatterns } = mergeStructurePatterns(
    first,
    second,
    addStructureProperty,
  );

  const additionalProperties = mergeStructureAdditionalProperties(
    first,
    second,
    addStructureProperty,
  );

  return {
    ...first,
    additionalProperties,
    defaultKeyPattern,
    isNever: first.isNever
      || second.isNever
      || rangeOfValues?.length === 0,
    nestedTransitiveNodes: [
      ...propertiesByName.values(),
      ...(propertyPatterns ?? []).map(([, node]) => node),
    ],
    properties: Object.fromEntries(propertiesByName),
    propertyPatterns,
    rangeOfValues,
  };
}

function addStructureProperty(
  first: TransitiveNode,
  second: TransitiveNode,
): TransitiveNode {
  const isRequired = first.isRequired || second.isRequired;
  const firstWithRequired = { ...first, isRequired };
  const secondWithRequired = { ...second, isRequired };

  if (first.isNever || second.isNever) {
    return doAdditionOfTransitiveNodes(firstWithRequired, secondWithRequired);
  }

  const isFirstSpecific = first.type !== 'unknown' && !first.isFallbackType;

  if (isFirstSpecific && second.isFallbackType) {
    return firstWithRequired;
  }

  const isSecondSpecific = second.type !== 'unknown' && !second.isFallbackType;

  if (isSecondSpecific && first.isFallbackType) {
    return secondWithRequired;
  }

  if (first.type === 'union' || second.type === 'union') {
    return createPropertyUnion(firstWithRequired, secondWithRequired);
  }

  const combinedValueTuple = combineDifferentPropertyValues(first, second);

  if (combinedValueTuple) {
    return {
      ...firstWithRequired,
      combinedValueTuple,
      rangeOfValues: undefined,
    };
  }

  if (first.combinedValueTuple && !second.rangeOfValues) {
    return firstWithRequired;
  }

  if (second.combinedValueTuple && !first.rangeOfValues) {
    return secondWithRequired;
  }

  if (isFirstSpecific && !isSecondSpecific) {
    return createTransitiveNodeWithAddedRange(
      firstWithRequired,
      secondWithRequired,
    );
  }

  if (isSecondSpecific && !isFirstSpecific) {
    return createTransitiveNodeWithAddedRange(
      secondWithRequired,
      firstWithRequired,
    );
  }

  if (first.type === 'reference'
    || second.type === 'reference'
    || !areMainNodeTypesEqual(first, second)
  ) {
    return createPropertyUnion(firstWithRequired, secondWithRequired);
  }

  return doAdditionOfTransitiveNodes(firstWithRequired, secondWithRequired);
}

function createPropertyUnion(
  first: TransitiveNode,
  second: TransitiveNode,
): TransitiveNode {
  return {
    ...addUnionTransitiveNodes(first, second),
    isInline: true,
    isRequired: first.isRequired || second.isRequired,
  };
}

function addUnionTransitiveNodes(
  first: TransitiveNode,
  second: TransitiveNode,
): TransitiveNode {
  const firstVariants = extractUnionVariants(first);
  const secondVariants = extractUnionVariants(second);
  const [firstVariant] = firstVariants;
  const [secondVariant] = secondVariants;

  if (firstVariant
    && secondVariant
    && first.type === 'union'
    && second.type === 'union'
    && firstVariants.length === 1
    && secondVariants.length === 1
    && firstVariant.type !== 'reference'
    && secondVariant.type !== 'reference'
    && areMainNodeTypesEqual(firstVariant, secondVariant)
  ) {
    const merged = doAdditionOfTransitiveNodes(firstVariant, secondVariant);

    if (!merged.isNever) {
      return merged;
    }
  }

  const variants = [...firstVariants, ...secondVariants].filter(
    (variant) => !variant.isNever,
  );

  const uniqueVariants = variants.filter((variant, index) => (
    variants.slice(0, index).every((previousVariant) => (
      hasSignificantNodeDifference(previousVariant, variant)
    ))
  ));

  if (!uniqueVariants.length) {
    return createNeverTransitiveNode(first);
  }

  const [uniqueVariant] = uniqueVariants;

  if (uniqueVariant && uniqueVariants.length === 1) {
    return uniqueVariant;
  }

  return {
    mixin: null,
    referredTransitiveNodes: uniqueVariants,
    source: first.source,
    type: 'union',
  };
}

function extractUnionVariants(
  transitiveNode: TransitiveNode,
): TransitiveNode[] {
  if (transitiveNode.type !== 'union') {
    return [transitiveNode];
  }

  const variants = transitiveNode.referredTransitiveNodes ?? [];
  const { mixin } = transitiveNode;

  if (!mixin) {
    return variants;
  }

  return variants.map((variant) => (
    doAdditionOfTransitiveNodes(mixin, variant)
  ));
}

function createNeverTransitiveNode(
  transitiveNode: TransitiveNode,
): TransitiveNode {
  return {
    ...transitiveNode,
    isNever: true,
  };
}
