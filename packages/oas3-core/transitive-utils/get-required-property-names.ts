import type { TransitiveNode } from '../transitive-node';

/**
 * Finds required properties at the current object level, following references
 * and combined schemas without descending into property or array item schemas.
 */
export function getRequiredPropertyNames(
  transitiveNode: TransitiveNode,
  maxDepth = 1024,
  ancestors = new Set<TransitiveNode>(),
  depth = 0,
): Set<string> {
  if (ancestors.has(transitiveNode)) {
    return new Set();
  }

  if (depth >= maxDepth) {
    throw new RangeError('Required property traversal exceeds maxDepth.');
  }

  const visited = new Set([...ancestors, transitiveNode]);
  const nextDepth = depth + 1;

  if (transitiveNode.type === 'reference') {
    return new Set([
      ...getRequiredPropertyNames(transitiveNode.ref, maxDepth, visited, nextDepth),
      ...transitiveNode.mixin
        ? getRequiredPropertyNames(transitiveNode.mixin, maxDepth, visited, nextDepth)
        : [],
    ]);
  }

  if (transitiveNode.type === 'structure') {
    const ownRequired = Object.entries(transitiveNode.properties ?? {})
      .filter(([, property]) => property.isRequired && !property.isNever)
      .map(([propertyName]) => propertyName);

    const requiredByBases = (transitiveNode.referredTransitiveNodes ?? [])
      .flatMap((node) => {
        if (nextDepth >= maxDepth && !visited.has(node)) {
          throw new RangeError('Required property traversal exceeds maxDepth.');
        }

        return [...getRequiredPropertyNames(node, maxDepth, visited, nextDepth)];
      });

    return new Set([...ownRequired, ...requiredByBases]);
  }

  if (transitiveNode.type !== 'intersection' && transitiveNode.type !== 'union') {
    return new Set();
  }

  const requiredByMember = (transitiveNode.referredTransitiveNodes ?? [])
    .map((node) => {
      if (nextDepth >= maxDepth && !visited.has(node)) {
        throw new RangeError('Required property traversal exceeds maxDepth.');
      }

      return getRequiredPropertyNames(node, maxDepth, visited, nextDepth);
    });

  const required = new Set(requiredByMember.flatMap((names) => [...names]));

  // A union requires a property only when every alternative requires it.
  const inheritedRequired = transitiveNode.type === 'union'
    ? [...required].filter((name) => requiredByMember.every((names) => names.has(name)))
    : [...required];

  return new Set([
    ...inheritedRequired,
    ...transitiveNode.mixin
      ? getRequiredPropertyNames(transitiveNode.mixin, maxDepth, visited, nextDepth)
      : [],
  ]);
}
