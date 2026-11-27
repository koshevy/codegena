import { defaultLogger, type Logger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { doAdditionOfTransitiveNodes } from '@codegena/oas3-core/transitive-parser';

export function resolveExclusiveUnionVariant(
  variant: TransitiveNode,
  logger?: Logger,
  maxDepth = 1024,
): TransitiveNode {
  if (variant.type !== 'reference') {
    return variant;
  }

  if (hasCircularReference(variant, new Set(), new Set(), maxDepth)) {
    const referenceName = variant.ref.name
      ?? variant.ref.suggestedName
      ?? variant.associatedRef
      ?? 'anonymous';

    (logger ?? defaultLogger).warn(
      { node: variant.source.node },
      `Cannot inline circular oneOf reference "${referenceName}". Kept named reference.`,
    );

    return variant;
  }

  return {
    ...unwrapReference(variant, maxDepth),
    isInline: true,
  };
}

function unwrapReference(
  node: TransitiveNode,
  maxDepth: number,
  depth = 0,
): TransitiveNode {
  if (depth >= maxDepth) {
    throw new RangeError('oneOf reference depth exceeds maxDepth.');
  }

  if (node.type !== 'reference') {
    return node;
  }

  const target = unwrapReference(node.ref, maxDepth, depth + 1);

  if (!node.mixin) {
    return target;
  }

  return doAdditionOfTransitiveNodes(
    target,
    unwrapReference(node.mixin, maxDepth, depth + 1),
  );
}

function hasCircularReference(
  node: TransitiveNode,
  ancestors: Set<TransitiveNode>,
  checked: Set<TransitiveNode>,
  maxDepth: number,
  depth = 0,
): boolean {
  if (ancestors.has(node)) {
    return true;
  }

  if (checked.has(node)) {
    return false;
  }

  if (depth >= maxDepth) {
    throw new RangeError('oneOf reference depth exceeds maxDepth.');
  }

  ancestors.add(node);

  const isCircular = getNestedNodes(node).some((nestedNode) => {
    if (depth + 1 >= maxDepth) {
      throw new RangeError('oneOf reference depth exceeds maxDepth.');
    }

    return hasCircularReference(
      nestedNode,
      ancestors,
      checked,
      maxDepth,
      depth + 1,
    );
  });

  ancestors.delete(node);
  checked.add(node);

  return isCircular;
}

function getNestedNodes(node: TransitiveNode): TransitiveNode[] {
  const nestedNodes = [
    ...node.referredTransitiveNodes ?? [],
    ...node.nestedTransitiveNodes ?? [],
    ...node.not ?? [],
  ];

  if ('mixin' in node && node.mixin) {
    nestedNodes.push(node.mixin);
  }

  if (node.type === 'reference') {
    nestedNodes.push(node.ref);
  }

  else if (node.type === 'structure') {
    nestedNodes.push(
      ...Object.values(node.properties ?? {}),
      ...(node.propertyPatterns ?? []).map(([, value]) => value),
    );

    if (node.additionalProperties) {
      nestedNodes.push(node.additionalProperties);
    }
  }

  else if (node.type === 'array') {
    nestedNodes.push(...node.itemsTuple ?? []);

    if (node.itemsInCommon) {
      nestedNodes.push(node.itemsInCommon);
    }

    if (node.restItemsInTuple) {
      nestedNodes.push(node.restItemsInTuple);
    }
  }

  else if (node.type === 'conditional') {
    if (typeof node.condition !== 'string') {
      nestedNodes.push(node.condition);
    }

    if (node.positiveResult) {
      nestedNodes.push(node.positiveResult);
    }

    if (node.negativeResult) {
      nestedNodes.push(node.negativeResult);
    }
  }

  return nestedNodes;
}
