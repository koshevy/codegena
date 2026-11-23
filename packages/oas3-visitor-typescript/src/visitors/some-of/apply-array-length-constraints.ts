import type {
  ArrayTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';

/** Applies length-only allOf members to the array that supplies item types. */
export function applyArrayLengthConstraints(
  variants: TransitiveNode[],
): TransitiveNode[] {
  const arrayVariants = variants.map((variant) => resolveArrayNode(variant));

  const concreteArrayIndexes = arrayVariants.flatMap((arrayNode, index) => (
    arrayNode && !arrayNode.isFallbackType && !arrayNode.itemsTuple
      ? [index]
      : []
  ));

  if (concreteArrayIndexes.length !== 1) {
    return variants;
  }

  const [concreteIndex] = concreteArrayIndexes;
  const concreteArray = arrayVariants[concreteIndex];

  if (!concreteArray) {
    return variants;
  }

  const lengthOnlyIndexes = arrayVariants.flatMap((arrayNode, index) => (
    arrayNode?.isFallbackType
    && (arrayNode.minLength !== undefined || arrayNode.maxLength !== undefined)
      ? [index]
      : []
  ));

  if (!lengthOnlyIndexes.length) {
    return variants;
  }

  const minLengths = [
    concreteArray.minLength,
    ...lengthOnlyIndexes.map((index) => arrayVariants[index]?.minLength),
  ].filter((value): value is number => value !== undefined);

  const maxLengths = [
    concreteArray.maxLength,
    ...lengthOnlyIndexes.map((index) => arrayVariants[index]?.maxLength),
  ].filter((value): value is number => value !== undefined);

  const constrainedArray: ArrayTransitiveNode = {
    ...concreteArray,
    ...(minLengths.length && { minLength: Math.max(...minLengths) }),
    ...(maxLengths.length && { maxLength: Math.min(...maxLengths) }),
    options: {
      ...concreteArray.options,
      transitiveNodeCacheKey: JSON.stringify([
        'array-length',
        variants[concreteIndex].source.jsonPath,
        minLengths,
        maxLengths,
      ]),
    },
  };

  return variants.flatMap((variant, index) => {
    if (index === concreteIndex) {
      return [constrainedArray];
    }

    return lengthOnlyIndexes.includes(index) ? [] : [variant];
  });
}

function resolveArrayNode(
  transitiveNode: TransitiveNode,
  visited = new Set<TransitiveNode>(),
): ArrayTransitiveNode | null {
  let currentNode = transitiveNode;

  while (!visited.has(currentNode)) {
    visited.add(currentNode);

    if (currentNode.type === 'array') {
      return currentNode;
    }

    if (currentNode.type !== 'reference' || currentNode.mixin) {
      return null;
    }

    currentNode = currentNode.ref;
  }

  return null;
}
