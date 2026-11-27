import type {
  StructureTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import {
  doAdditionOfTransitiveNodes,
  subtractTransitiveNode,
} from '@codegena/oas3-core/transitive-parser';

/**
 * Adds `never` properties that exclude every other object variant.
 */
export function createExclusiveUnionVariant(
  variant: TransitiveNode,
  variants: TransitiveNode[],
): TransitiveNode {
  return variants.reduce((result, otherVariant) => {
    if (variant === otherVariant) {
      return result;
    }

    const excludedProperties = createExcludedProperties(
      variant,
      otherVariant,
    );

    if (!excludedProperties) {
      return result;
    }

    return doAdditionOfTransitiveNodes(result, excludedProperties);
  }, variant);
}

function createExcludedProperties(
  variant: TransitiveNode,
  otherVariant: TransitiveNode,
): StructureTransitiveNode | null {
  if (variant.type !== 'structure' || otherVariant.type !== 'structure') {
    return null;
  }

  const subtraction = subtractTransitiveNode(otherVariant, variant, {
    markUnmatchedPropertiesAsNever: true,
  });

  if (subtraction.type !== 'structure') {
    return null;
  }

  const properties = Object.fromEntries(
    Object.entries(subtraction.properties ?? {}).filter(
      ([propertyName, property]) => (
        !variant.properties?.[propertyName] && property.isNever
      ),
    ),
  );

  if (!Object.keys(properties).length) {
    return null;
  }

  return {
    ...subtraction,
    nestedTransitiveNodes: Object.values(properties),
    properties,
  };
}
