import type {
  StructureTransitiveNode,
  TransitiveNode,
} from '../transitive-node';

export function mergeStructureAdditionalProperties(
  first: StructureTransitiveNode,
  second: StructureTransitiveNode,
  mergeValue: (
    firstValue: TransitiveNode,
    secondValue: TransitiveNode,
  ) => TransitiveNode,
): StructureTransitiveNode['additionalProperties'] {
  const firstAdditional = first.additionalProperties;
  const secondAdditional = second.additionalProperties;

  if (firstAdditional === false || secondAdditional === false) {
    return false;
  }

  if (!firstAdditional) {
    return secondAdditional;
  }

  if (!secondAdditional) {
    return firstAdditional;
  }

  return mergeValue(firstAdditional, secondAdditional);
}
