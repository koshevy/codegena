import type {
  ConditionalTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';

/**
 * Collects source nodes so unchanged branch nodes retain their parser cache.
 */
export function createConditionalSourceNodeSet(
  transitiveNode: ConditionalTransitiveNode,
  maxDepth = 1024,
): Set<TransitiveNode> {
  const sourceNodes = new Set<TransitiveNode>();

  collectSourceNodes(transitiveNode, sourceNodes, maxDepth);

  return sourceNodes;
}

function collectSourceNodes(
  transitiveNode: TransitiveNode,
  sourceNodes: Set<TransitiveNode>,
  maxDepth: number,
  depth = 0,
): void {
  if (sourceNodes.has(transitiveNode)) {
    return;
  }

  sourceNodes.add(transitiveNode);

  if (depth >= maxDepth) {
    return;
  }

  const children: Array<TransitiveNode | false | null | undefined> = [
    ...transitiveNode.nestedTransitiveNodes ?? [],
    ...transitiveNode.referredTransitiveNodes ?? [],
  ];

  if (transitiveNode.type === 'array') {
    children.push(
      transitiveNode.itemsInCommon,
      ...transitiveNode.itemsTuple ?? [],
      transitiveNode.restItemsInTuple,
    );
  }

  else if (transitiveNode.type === 'conditional') {
    if (typeof transitiveNode.condition !== 'string') {
      children.push(transitiveNode.condition);
    }

    children.push(
      transitiveNode.mixin,
      transitiveNode.positiveResult,
      transitiveNode.negativeResult,
    );
  }

  else if (transitiveNode.type === 'reference') {
    children.push(transitiveNode.ref, transitiveNode.mixin);
  }

  else if (transitiveNode.type === 'structure') {
    children.push(
      transitiveNode.additionalProperties,
      ...Object.values(transitiveNode.properties ?? {}),
      ...(transitiveNode.propertyPatterns ?? []).map(([, node]) => node),
    );
  }

  else if (transitiveNode.type === 'union') {
    children.push(transitiveNode.mixin);
  }

  const nextDepth = depth + 1;

  children.forEach((child) => {
    if (!child) {
      return;
    }

    if (nextDepth >= maxDepth) {
      sourceNodes.add(child);

      return;
    }

    collectSourceNodes(child, sourceNodes, maxDepth, nextDepth);
  });
}
