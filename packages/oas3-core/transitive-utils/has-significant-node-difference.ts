import isEqual from 'lodash/isEqual';

import type {
  StructureTransitiveNode,
  TransitiveNode,
  UnionTransitiveNode,
} from '../transitive-node';

interface SignificantDifferenceOptions {
  ignoreRangeOfValues?: boolean;
}

type NestedTransitiveNode = TransitiveNode | false | null | undefined;
type VisitedNodePairs = Map<TransitiveNode, Set<TransitiveNode>>;

/**
 * Checks differences which affect the values a generated declaration accepts.
 *
 * Node and scalar types, nullability, requiredness, value ranges, scalar
 * options, structure shape, and union members are significant. Parsed scalar,
 * structure, and union nodes ignore names, source locations, annotations,
 * and other generation metadata. Nodes without a supported structural
 * subtraction use their source values as a conservative semantic comparison.
 */
export function hasSignificantNodeDifference(
  minuend: TransitiveNode,
  subtrahend: TransitiveNode,
  options: SignificantDifferenceOptions = {},
  visited: VisitedNodePairs = new Map(),
): boolean {
  if (!areMainNodeTypesEqual(minuend, subtrahend)) {
    return true;
  }

  if (minuend.isNullable !== subtrahend.isNullable
    || minuend.isRequired !== subtrahend.isRequired
    || (!options.ignoreRangeOfValues
      && !isEqual(minuend.rangeOfValues, subtrahend.rangeOfValues))
  ) {
    return true;
  }

  if (wasNodePairVisited(minuend, subtrahend, visited)) {
    return false;
  }

  if (minuend.type === 'scalar' && subtrahend.type === 'scalar') {
    return !isEqual(minuend.numberOptions, subtrahend.numberOptions)
      || !isEqual(minuend.stringOptions, subtrahend.stringOptions);
  }

  if (minuend.type === 'structure' && subtrahend.type === 'structure') {
    return hasStructureNodeDifference(minuend, subtrahend, options, visited);
  }

  if (minuend.type === 'union' && subtrahend.type === 'union') {
    return hasUnionNodeDifference(minuend, subtrahend, options, visited);
  }

  return !isEqual(minuend.source.value, subtrahend.source.value);
}

export function areMainNodeTypesEqual(
  minuend: TransitiveNode,
  subtrahend: TransitiveNode,
): boolean {
  if (minuend.type !== subtrahend.type) {
    return false;
  }

  return minuend.type !== 'scalar'
    || subtrahend.type !== 'scalar'
    || minuend.scalarType === subtrahend.scalarType;
}

export function isMinuendCoveredBySubtrahend(
  minuend: TransitiveNode,
  subtrahend: TransitiveNode,
): boolean {
  if (!areMainNodeTypesEqual(minuend, subtrahend)
    || hasSignificantNodeDifference(
      minuend,
      subtrahend,
      { ignoreRangeOfValues: true },
    )
  ) {
    return false;
  }

  if (!minuend.rangeOfValues) {
    return !subtrahend.rangeOfValues;
  }

  if (!subtrahend.rangeOfValues) {
    return true;
  }

  return minuend.rangeOfValues.every((minuendValue) => (
    subtrahend.rangeOfValues?.some((subtrahendValue) => (
      isEqual(minuendValue, subtrahendValue)
    ))
  ));
}

function hasStructureNodeDifference(
  minuend: StructureTransitiveNode,
  subtrahend: StructureTransitiveNode,
  options: SignificantDifferenceOptions,
  visited: VisitedNodePairs,
): boolean {
  if (minuend.isRecursive !== subtrahend.isRecursive
    || !isEqual(minuend.defaultKeyPattern, subtrahend.defaultKeyPattern)
    || hasNestedNodeDifference(
      minuend.additionalProperties,
      subtrahend.additionalProperties,
      options,
      visited,
    )
  ) {
    return true;
  }

  if (hasStructurePropertiesDifference(
    minuend.properties,
    subtrahend.properties,
    options,
    visited,
  )) {
    return true;
  }

  return hasPropertyPatternsDifference(
    minuend.propertyPatterns,
    subtrahend.propertyPatterns,
    options,
    visited,
  );
}

function hasUnionNodeDifference(
  minuend: UnionTransitiveNode,
  subtrahend: UnionTransitiveNode,
  options: SignificantDifferenceOptions,
  visited: VisitedNodePairs,
): boolean {
  return hasNestedNodeDifference(
    minuend.mixin,
    subtrahend.mixin,
    options,
    visited,
  ) || hasUnorderedNodeArrayDifference(
    minuend.referredTransitiveNodes,
    subtrahend.referredTransitiveNodes,
    options,
    visited,
  );
}

function hasNestedNodeDifference(
  minuend: NestedTransitiveNode,
  subtrahend: NestedTransitiveNode,
  options: SignificantDifferenceOptions,
  visited: VisitedNodePairs,
): boolean {
  if (minuend === subtrahend) {
    return false;
  }

  if (!minuend || !subtrahend) {
    return true;
  }

  return hasSignificantNodeDifference(minuend, subtrahend, options, visited);
}

function hasUnorderedNodeArrayDifference(
  minuend: TransitiveNode[] | undefined,
  subtrahend: TransitiveNode[] | undefined,
  options: SignificantDifferenceOptions,
  visited: VisitedNodePairs,
): boolean {
  const minuendNodes = minuend ?? [];
  const unmatchedSubtrahendNodes = [...subtrahend ?? []];

  if (minuendNodes.length !== unmatchedSubtrahendNodes.length) {
    return true;
  }

  return minuendNodes.some((minuendNode) => {
    const matchingIndex = unmatchedSubtrahendNodes.findIndex(
      (subtrahendNode) => !hasSignificantNodeDifference(
        minuendNode,
        subtrahendNode,
        options,
        visited,
      ),
    );

    if (matchingIndex === -1) {
      return true;
    }

    unmatchedSubtrahendNodes.splice(matchingIndex, 1);

    return false;
  });
}

function hasStructurePropertiesDifference(
  minuend: Record<string, TransitiveNode> | undefined,
  subtrahend: Record<string, TransitiveNode> | undefined,
  options: SignificantDifferenceOptions,
  visited: VisitedNodePairs,
): boolean {
  const minuendProperties = Object.entries(minuend ?? {});
  const subtrahendProperties = subtrahend ?? {};

  return minuendProperties.length !== Object.keys(subtrahendProperties).length
    || minuendProperties.some(([propertyName, minuendProperty]) => {
      const subtrahendProperty = subtrahendProperties[propertyName];

      return !subtrahendProperty || hasSignificantNodeDifference(
        minuendProperty,
        subtrahendProperty,
        options,
        visited,
      );
    });
}

function hasPropertyPatternsDifference(
  minuend: [RegExp, TransitiveNode][] | undefined,
  subtrahend: [RegExp, TransitiveNode][] | undefined,
  options: SignificantDifferenceOptions,
  visited: VisitedNodePairs,
): boolean {
  const minuendPatterns = minuend ?? [];
  const subtrahendPatterns = subtrahend ?? [];

  return minuendPatterns.length !== subtrahendPatterns.length
    || minuendPatterns.some(([minuendPattern, minuendNode], index) => {
      const subtrahendPattern = subtrahendPatterns[index];

      return !subtrahendPattern
        || !isEqual(minuendPattern, subtrahendPattern[0])
        || hasSignificantNodeDifference(
          minuendNode,
          subtrahendPattern[1],
          options,
          visited,
        );
    });
}

function wasNodePairVisited(
  minuend: TransitiveNode,
  subtrahend: TransitiveNode,
  visited: VisitedNodePairs,
): boolean {
  const visitedSubtrahends = visited.get(minuend);

  if (visitedSubtrahends?.has(subtrahend)) {
    return true;
  }

  if (visitedSubtrahends) {
    visitedSubtrahends.add(subtrahend);

    return false;
  }

  visited.set(minuend, new Set([subtrahend]));

  return false;
}
