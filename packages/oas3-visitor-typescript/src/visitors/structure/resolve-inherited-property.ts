import type {
  StructureTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';

/** Resolves a property after recursive references have finished parsing. */
export function resolveInheritedProperty(
  transitiveNode: StructureTransitiveNode,
  propertyName: string,
): TransitiveNode | undefined {
  const visited = new Set<TransitiveNode>([transitiveNode]);
  const referredNodes = transitiveNode.referredTransitiveNodes ?? [];

  for (const referredNode of referredNodes) {
    const property = findProperty(referredNode, propertyName, visited);

    if (property) {
      return property;
    }
  }

  return undefined;
}

function findProperty(
  transitiveNode: TransitiveNode | null,
  propertyName: string,
  visited: Set<TransitiveNode>,
): TransitiveNode | undefined {
  if (!transitiveNode || visited.has(transitiveNode)) {
    return undefined;
  }

  visited.add(transitiveNode);

  if (transitiveNode.type === 'reference') {
    return findProperty(transitiveNode.mixin, propertyName, visited)
      ?? findProperty(transitiveNode.ref, propertyName, visited);
  }

  if (transitiveNode.type !== 'structure') {
    return undefined;
  }

  const property = transitiveNode.properties?.[propertyName];

  if (property && property.type !== 'unknown' && !property.isFallbackType) {
    return property;
  }

  const referredNodes = transitiveNode.referredTransitiveNodes ?? [];

  for (const referredNode of referredNodes) {
    const inheritedProperty = findProperty(referredNode, propertyName, visited);

    if (inheritedProperty) {
      return inheritedProperty;
    }
  }

  return undefined;
}
