import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

export type CloneConditionalVariantNode = (
  transitiveNode: TransitiveNode,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
) => TransitiveNode;

export function cloneMixinConditionalVariantNode(
  transitiveNode: TransitiveNode | null,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
  cloneTransitiveNode: CloneConditionalVariantNode,
): TransitiveNode | null {
  if (!transitiveNode) {
    return null;
  }

  return cloneTransitiveNode(
    transitiveNode,
    cacheKey,
    sourceNodes,
    clonedNodes,
  );
}

export function cloneOptionalConditionalVariantNode(
  transitiveNode: TransitiveNode | undefined,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
  cloneTransitiveNode: CloneConditionalVariantNode,
): TransitiveNode | undefined {
  if (!transitiveNode) {
    return undefined;
  }

  return cloneTransitiveNode(
    transitiveNode,
    cacheKey,
    sourceNodes,
    clonedNodes,
  );
}
