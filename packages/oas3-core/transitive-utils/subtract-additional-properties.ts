import { createNeverUnknownTransitiveNode } from './create-never-unknown-transitive-node';
import type {
  StructureTransitiveNode,
  TransitiveNode,
} from '../transitive-node';

export function subtractAdditionalProperties(
  minuend: StructureTransitiveNode['additionalProperties'],
  subtrahend: StructureTransitiveNode['additionalProperties'],
  subtractNode: (
    minuendNode: TransitiveNode,
    subtrahendNode: TransitiveNode,
  ) => TransitiveNode,
): StructureTransitiveNode['additionalProperties'] {
  if (!minuend || !subtrahend) {
    return minuend;
  }

  const subtraction = subtractNode(minuend, subtrahend);

  if (subtraction.type !== 'structure'
    || subtrahend.type !== 'structure'
  ) {
    return subtraction;
  }

  const subtrahendProperties = Object.entries(
    subtrahend.properties ?? {},
  );

  const propertiesByName = subtrahendProperties.reduce((result, [name, property]) => {
    if (!result.has(name)) {
      result.set(name, createNeverUnknownTransitiveNode(name, property));
    }

    return result;
  }, new Map(Object.entries(subtraction.properties ?? {})));

  return {
    ...subtraction,
    nestedTransitiveNodes: [
      ...propertiesByName.values(),
      ...(subtraction.propertyPatterns ?? []).map(([, node]) => node),
    ],
    properties: Object.fromEntries(propertiesByName),
  };
}
