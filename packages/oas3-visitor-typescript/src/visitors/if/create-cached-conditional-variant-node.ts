import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

const transitiveNodeCacheKeyOption = 'transitiveNodeCacheKey';

/**
 * Adds a cache key to a transitive node derived for a conditional branch.
 */
export function createCachedConditionalVariantNode<
  TTransitiveNode extends TransitiveNode,
>(
  transitiveNode: TTransitiveNode,
  cacheKey: string,
): TTransitiveNode {
  return {
    ...transitiveNode,
    options: {
      ...transitiveNode.options,
      [transitiveNodeCacheKeyOption]: cacheKey,
    },
  };
}
