import isEqual from 'lodash/isEqual';

import { createNeverUnknownTransitiveNode } from './create-never-unknown-transitive-node';
import {
  areMainNodeTypesEqual,
  isMinuendCoveredBySubtrahend,
} from './has-significant-node-difference';
import { subtractAdditionalProperties } from './subtract-additional-properties';
import type {
  IntersectionTransitiveNode,
  StructureTransitiveNode,
  TransitiveNode,
  UnionTransitiveNode,
} from '../transitive-node';

export interface SubtractTransitiveNodeOptions {
  markUnmatchedPropertiesAsNever?: boolean;
}

/**
 * Removes from a transitive node the schema parts available in another node.
 */
export function subtractTransitiveNode(
  minuend: TransitiveNode,
  subtrahend: TransitiveNode,
  options: SubtractTransitiveNodeOptions = {},
): TransitiveNode {
  const unwrappedNode = unwrapSubtractionTarget(minuend);

  return subtractResolvedTransitiveNode(unwrappedNode, subtrahend, options);
}

function subtractResolvedTransitiveNode(
  minuend: TransitiveNode,
  subtrahend: TransitiveNode,
  options: SubtractTransitiveNodeOptions,
): TransitiveNode {
  if (minuend.type === 'union' && minuend.isVariativeSchema) {
    return {
      ...minuend,
      not: [...minuend.not ?? [], subtrahend],
    };
  }

  if (minuend.type === 'union'
    && !areMainNodeTypesEqual(minuend, subtrahend)
  ) {
    return {
      ...minuend,
      not: [...minuend.not ?? [], subtrahend],
    };
  }

  if (minuend.type === 'intersection'
    && subtrahend.type === 'structure'
  ) {
    return subtractIntersectionStructure(minuend, subtrahend, options);
  }

  if (!areMainNodeTypesEqual(minuend, subtrahend)) {
    return minuend;
  }

  const rangeSubtraction = subtractRangeOfValues(minuend, subtrahend);

  if (rangeSubtraction) {
    return rangeSubtraction;
  }

  if (minuend.type === 'structure' && subtrahend.type === 'structure') {
    return subtractStructureTransitiveNode(minuend, subtrahend, options);
  }

  if (minuend.type === 'union' && subtrahend.type === 'union') {
    return subtractUnionTransitiveNode(minuend, subtrahend, options);
  }

  return minuend;
}

function subtractIntersectionStructure(
  minuend: IntersectionTransitiveNode,
  subtrahend: StructureTransitiveNode,
  options: SubtractTransitiveNodeOptions,
): IntersectionTransitiveNode {
  const subtractStructure = (node: TransitiveNode): TransitiveNode => (
    node.type === 'structure'
      ? subtractTransitiveNode(node, subtrahend, options)
      : node
  );

  return {
    ...minuend,
    mixin: minuend.mixin
      ? subtractStructure(minuend.mixin)
      : minuend.mixin,
    referredTransitiveNodes: minuend.referredTransitiveNodes?.map((node) => (
      subtractStructure(node)
    )),
  };
}

function unwrapSubtractionTarget(node: TransitiveNode): TransitiveNode {
  const visited = new Set<TransitiveNode>();
  let currentNode = node;

  while (!visited.has(currentNode)) {
    visited.add(currentNode);

    if (currentNode.type === 'reference'
      && currentNode.ref
      && !currentNode.mixin
    ) {
      currentNode = currentNode.ref;

      continue;
    }

    if (currentNode.type === 'intersection'
      && !currentNode.mixin
      && currentNode.referredTransitiveNodes?.length === 1
    ) {
      currentNode = currentNode.referredTransitiveNodes[0];

      continue;
    }

    return currentNode;
  }

  return node;
}

function subtractRangeOfValues(
  minuend: TransitiveNode,
  subtrahend: TransitiveNode,
): TransitiveNode | null {
  const minuendValues = minuend.rangeOfValues;
  const subtrahendValues = subtrahend.rangeOfValues;

  if (!minuendValues || !subtrahendValues) {
    return null;
  }

  const rangeOfValues = minuendValues.filter((minuendValue) => (
    subtrahendValues.every((subtrahendValue) => (
      !isEqual(minuendValue, subtrahendValue)
    ))
  ));

  if (rangeOfValues.length === minuendValues.length) {
    return null;
  }

  return {
    ...minuend,
    isNever: rangeOfValues.length === 0 || minuend.isNever,
    rangeOfValues,
  };
}

function subtractStructureTransitiveNode(
  minuend: StructureTransitiveNode,
  subtrahend: StructureTransitiveNode,
  options: SubtractTransitiveNodeOptions,
): StructureTransitiveNode {
  if (!subtrahend.properties && !subtrahend.additionalProperties) {
    return minuend;
  }

  const propertiesByName = Object.entries(minuend.properties ?? {}).reduce(
    (result, [propertyName, minuendProperty]) => {
      const subtrahendProperty = subtrahend.properties?.[propertyName];

      if (!subtrahendProperty) {
        result.set(propertyName, options.markUnmatchedPropertiesAsNever
          ? createNeverUnknownTransitiveNode(propertyName, minuendProperty)
          : minuendProperty);

        return result;
      }

      if (isUnconstrainedRequiredProperty(subtrahendProperty)
        || isMinuendCoveredBySubtrahend(
          minuendProperty,
          subtrahendProperty,
        )
      ) {
        result.set(propertyName, createNeverUnknownTransitiveNode(
          propertyName,
          minuendProperty,
        ));

        return result;
      }

      result.set(propertyName, subtractTransitiveNode(
        minuendProperty,
        subtrahendProperty,
        options,
      ));

      return result;
    },
    new Map<string, TransitiveNode>(),
  );

  const additionalProperties = subtractAdditionalProperties(
    minuend.additionalProperties,
    subtrahend.additionalProperties,
    (first, second) => subtractTransitiveNode(first, second, options),
  );

  return {
    ...minuend,
    additionalProperties,
    nestedTransitiveNodes: [
      ...propertiesByName.values(),
      ...(minuend.propertyPatterns ?? []).map(([, node]) => node),
    ],
    properties: Object.fromEntries(propertiesByName),
  };
}

function isUnconstrainedRequiredProperty(node: TransitiveNode): boolean {
  return node.type === 'unknown'
    && node.isRequired === true
    && !node.isFallbackType
    && !node.isNever
    && !node.rangeOfValues
    && !node.combinedValueTuple
    && !node.not?.length;
}

function subtractUnionTransitiveNode(
  minuend: UnionTransitiveNode,
  subtrahend: UnionTransitiveNode,
  options: SubtractTransitiveNodeOptions,
): UnionTransitiveNode {
  const minuendVariants = minuend.referredTransitiveNodes ?? [];
  const subtrahendVariants = subtrahend.referredTransitiveNodes ?? [];
  const referredTransitiveNodes = minuendVariants.flatMap((minuendVariant) => {
    const subtraction = subtractUnionVariant(
      minuendVariant,
      subtrahendVariants,
      options,
    );

    return subtraction ? [subtraction] : [];
  });

  if (areTransitiveNodeArraysEqual(
    referredTransitiveNodes,
    minuendVariants,
  )) {
    return minuend;
  }

  return {
    ...minuend,
    referredTransitiveNodes,
  };
}

function subtractUnionVariant(
  minuend: TransitiveNode,
  subtrahends: TransitiveNode[],
  options: SubtractTransitiveNodeOptions,
): TransitiveNode | null {
  return subtrahends.reduce<TransitiveNode | null>(
    (result, subtrahend) => {
      if (!result || isMinuendCoveredBySubtrahend(result, subtrahend)) {
        return null;
      }

      const subtraction = subtractTransitiveNode(
        result,
        subtrahend,
        options,
      );

      return subtraction.isNever ? null : subtraction;
    },
    minuend,
  );
}

function areTransitiveNodeArraysEqual(
  first: TransitiveNode[],
  second: TransitiveNode[],
): boolean {
  return first.length === second.length
    && first.every((transitiveNode, index) => (
      transitiveNode === second[index]
    ));
}
