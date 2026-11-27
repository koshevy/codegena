import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

export function getTerminalNodeTypes(
  transitiveNode: TransitiveNode,
  visited = new Set<TransitiveNode>(),
): Set<TransitiveNode['type']> {
  if (visited.has(transitiveNode)) {
    return new Set();
  }

  visited.add(transitiveNode);

  if (transitiveNode.type === 'reference') {
    return getWrappingNodeTerminalTypes(
      [transitiveNode.mixin, transitiveNode.ref],
      visited,
    );
  }

  if (transitiveNode.type === 'intersection'
    || transitiveNode.type === 'union'
  ) {
    return getWrappingNodeTerminalTypes(
      [
        transitiveNode.mixin,
        ...(transitiveNode.referredTransitiveNodes ?? []),
      ],
      visited,
    );
  }

  return new Set([transitiveNode.type]);
}

function getWrappingNodeTerminalTypes(
  transitiveNodes: (TransitiveNode | null)[],
  visited: Set<TransitiveNode>,
): Set<TransitiveNode['type']> {
  const result = new Set<TransitiveNode['type']>();

  transitiveNodes.forEach((transitiveNode) => {
    if (!transitiveNode) {
      return;
    }

    getTerminalNodeTypes(transitiveNode, visited).forEach((type) => {
      result.add(type);
    });
  });

  return result;
}
