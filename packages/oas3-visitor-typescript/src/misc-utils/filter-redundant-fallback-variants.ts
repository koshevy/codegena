import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

import { getTerminalNodeTypes } from './get-terminal-node-types';

export function filterRedundantFallbackVariants(
  variants: TransitiveNode[],
  maxDepth = 1024,
): TransitiveNode[] {
  const concreteVariants = variants.filter((variant) => (
    !isFallbackVariant(variant, maxDepth)
  ));

  const concreteTypes = new Set(
    concreteVariants.flatMap((variant) => [...getTerminalNodeTypes(variant)]),
  );

  return variants.filter((variant) => {
    if (!isFallbackVariant(variant, maxDepth)) {
      return true;
    }

    const fallbackTypes = getTerminalNodeTypes(variant);

    if (fallbackTypes.size === 1 && fallbackTypes.has('unknown')) {
      return !concreteVariants.length;
    }

    return [...fallbackTypes].every((type) => (
      !concreteTypes.has(type)
    ));
  });
}

function isFallbackVariant(
  transitiveNode: TransitiveNode,
  maxDepth: number,
  depth = 0,
  visited = new Set<TransitiveNode>(),
): boolean {
  if (depth >= maxDepth) {
    return false;
  }

  if (transitiveNode.isFallbackType) {
    return true;
  }

  if (transitiveNode.type === 'unknown') {
    return !transitiveNode.name && !transitiveNode.suggestedName;
  }

  if (visited.has(transitiveNode)) {
    return false;
  }

  const nextVisited = new Set(visited);

  nextVisited.add(transitiveNode);

  if (transitiveNode.type === 'reference') {
    const isMixinIsFallback = !transitiveNode.mixin
      || isFallbackVariant(
        transitiveNode.mixin,
        maxDepth,
        depth + 1,
        nextVisited,
      );

    return isMixinIsFallback
      && isFallbackVariant(transitiveNode.ref, maxDepth, depth + 1, nextVisited);
  }

  if (transitiveNode.type !== 'union'
    && transitiveNode.type !== 'intersection'
  ) {
    return false;
  }

  const members = [
    ...(transitiveNode.mixin ? [transitiveNode.mixin] : []),
    ...transitiveNode.referredTransitiveNodes ?? [],
  ];

  return members.length > 0
    && members.every((member) => (
      depth + 1 < maxDepth
      && isFallbackVariant(member, maxDepth, depth + 1, nextVisited)
    ));
}
