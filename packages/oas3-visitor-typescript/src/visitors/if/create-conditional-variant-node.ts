import type {
  ArrayTransitiveNode,
  ConditionalTransitiveNode,
  RefTransitiveNode,
  StructureTransitiveNode,
  TransitiveNode,
  UnionTransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import {
  cloneMixinConditionalVariantNode,
  cloneOptionalConditionalVariantNode,
} from './clone-conditional-variant-node-utils';
import {
  createCachedConditionalVariantNode,
} from './create-cached-conditional-variant-node';

export function createConditionalVariantNode(
  transitiveNode: TransitiveNode,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
): TransitiveNode {
  return cloneConditionalVariantNode(
    transitiveNode,
    cacheKey,
    sourceNodes,
    new Map(),
  );
}

function cloneConditionalVariantNode(
  transitiveNode: TransitiveNode,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
): TransitiveNode {
  if (sourceNodes.has(transitiveNode)) {
    return transitiveNode;
  }

  const existingClone = clonedNodes.get(transitiveNode);

  if (existingClone) {
    return existingClone;
  }

  if (transitiveNode.type === 'array') {
    return cloneArrayTransitiveNode(
      transitiveNode,
      cacheKey,
      sourceNodes,
      clonedNodes,
    );
  }

  if (transitiveNode.type === 'conditional') {
    return cloneConditionalTransitiveNode(
      transitiveNode,
      cacheKey,
      sourceNodes,
      clonedNodes,
    );
  }

  if (transitiveNode.type === 'reference') {
    return cloneRefTransitiveNode(
      transitiveNode,
      cacheKey,
      sourceNodes,
      clonedNodes,
    );
  }

  if (transitiveNode.type === 'structure') {
    return cloneStructureTransitiveNode(
      transitiveNode,
      cacheKey,
      sourceNodes,
      clonedNodes,
    );
  }

  if (transitiveNode.type === 'union') {
    return cloneUnionTransitiveNode(
      transitiveNode,
      cacheKey,
      sourceNodes,
      clonedNodes,
    );
  }

  const clonedNode = createCachedConditionalVariantNode(
    transitiveNode,
    cacheKey,
  );

  clonedNodes.set(transitiveNode, clonedNode);

  return clonedNode;
}

function cloneArrayTransitiveNode(
  transitiveNode: ArrayTransitiveNode,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
): ArrayTransitiveNode {
  const clonedNode = createCachedConditionalVariantNode(
    transitiveNode,
    cacheKey,
  );

  clonedNodes.set(transitiveNode, clonedNode);

  Object.assign(clonedNode, {
    itemsInCommon: cloneOptionalConditionalVariantNode(
      transitiveNode.itemsInCommon,
      cacheKey,
      sourceNodes,
      clonedNodes,
      cloneConditionalVariantNode,
    ),
    itemsTuple: transitiveNode.itemsTuple?.map((item) => (
      cloneConditionalVariantNode(item, cacheKey, sourceNodes, clonedNodes)
    )),
    restItemsInTuple: cloneOptionalConditionalVariantNode(
      transitiveNode.restItemsInTuple,
      cacheKey,
      sourceNodes,
      clonedNodes,
      cloneConditionalVariantNode,
    ),
  });

  return clonedNode;
}

function cloneConditionalTransitiveNode(
  transitiveNode: ConditionalTransitiveNode,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
): ConditionalTransitiveNode {
  const clonedNode = createCachedConditionalVariantNode(
    transitiveNode,
    cacheKey,
  );

  clonedNodes.set(transitiveNode, clonedNode);

  Object.assign(clonedNode, {
    condition: typeof transitiveNode.condition === 'string'
      ? transitiveNode.condition
      : cloneConditionalVariantNode(
          transitiveNode.condition,
          cacheKey,
          sourceNodes,
          clonedNodes,
        ),
    mixin: cloneMixinConditionalVariantNode(
      transitiveNode.mixin,
      cacheKey,
      sourceNodes,
      clonedNodes,
      cloneConditionalVariantNode,
    ),
    negativeResult: cloneOptionalConditionalVariantNode(
      transitiveNode.negativeResult,
      cacheKey,
      sourceNodes,
      clonedNodes,
      cloneConditionalVariantNode,
    ),
    positiveResult: cloneOptionalConditionalVariantNode(
      transitiveNode.positiveResult,
      cacheKey,
      sourceNodes,
      clonedNodes,
      cloneConditionalVariantNode,
    ),
  });

  return clonedNode;
}

function cloneRefTransitiveNode(
  transitiveNode: RefTransitiveNode,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
): RefTransitiveNode {
  const clonedNode = createCachedConditionalVariantNode(
    transitiveNode,
    cacheKey,
  );

  clonedNodes.set(transitiveNode, clonedNode);

  Object.assign(clonedNode, {
    mixin: cloneMixinConditionalVariantNode(
      transitiveNode.mixin,
      cacheKey,
      sourceNodes,
      clonedNodes,
      cloneConditionalVariantNode,
    ),
    ref: cloneConditionalVariantNode(
      transitiveNode.ref,
      cacheKey,
      sourceNodes,
      clonedNodes,
    ),
  });

  return clonedNode;
}

function cloneStructureTransitiveNode(
  transitiveNode: StructureTransitiveNode,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
): StructureTransitiveNode {
  const clonedNode = createCachedConditionalVariantNode(
    transitiveNode,
    cacheKey,
  );

  clonedNodes.set(transitiveNode, clonedNode);

  Object.assign(clonedNode, {
    additionalProperties: transitiveNode.additionalProperties === false
      ? false
      : cloneOptionalConditionalVariantNode(
          transitiveNode.additionalProperties,
          cacheKey,
          sourceNodes,
          clonedNodes,
          cloneConditionalVariantNode,
        ),
    properties: Object.fromEntries(
      Object.entries(transitiveNode.properties ?? {}).map(
        ([propertyName, property]) => [
          propertyName,
          cloneConditionalVariantNode(
            property,
            cacheKey,
            sourceNodes,
            clonedNodes,
          ),
        ],
      ),
    ),
    propertyPatterns: transitiveNode.propertyPatterns?.map(([pattern, node]) => [
      pattern,
      cloneConditionalVariantNode(node, cacheKey, sourceNodes, clonedNodes),
    ]),
  });

  return clonedNode;
}

function cloneUnionTransitiveNode(
  transitiveNode: UnionTransitiveNode,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
  clonedNodes: Map<TransitiveNode, TransitiveNode>,
): UnionTransitiveNode {
  const clonedNode = createCachedConditionalVariantNode(
    transitiveNode,
    cacheKey,
  );

  clonedNodes.set(transitiveNode, clonedNode);

  Object.assign(clonedNode, {
    mixin: cloneMixinConditionalVariantNode(
      transitiveNode.mixin,
      cacheKey,
      sourceNodes,
      clonedNodes,
      cloneConditionalVariantNode,
    ),
    referredTransitiveNodes: transitiveNode.referredTransitiveNodes?.map(
      (node) => cloneConditionalVariantNode(
        node,
        cacheKey,
        sourceNodes,
        clonedNodes,
      ),
    ),
  });

  return clonedNode;
}
