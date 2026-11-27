import type { Logger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

import { getRenderableVariants } from './get-renderable-variants';

/** Exposes anonymous nested allOf members to the parent intersection merge. */
export function flattenInlineIntersectionParts(
  part: TransitiveNode,
  logger: Logger | undefined,
  ancestors = new Set<TransitiveNode>(),
  maxDepth = 1024,
  depth = 0,
): TransitiveNode[] {
  if (depth >= maxDepth
    || part.type !== 'intersection'
    || !part.isInline
    || part.name
    || part.not?.length
    || part.rangeOfValues
    || part.combinedValueTuple
    || part.isNever
    || part.isFallbackType
    || part.isNullable
    || part.isRequired
    || part.isReadOnly
    || part.isWriteOnly
    || ancestors.has(part)
  ) {
    return [part];
  }

  const nestedAncestors = new Set(ancestors);

  nestedAncestors.add(part);

  const variants = getRenderableVariants(part, logger);
  const nestedParts = part.mixin
    ? [part.mixin, ...variants]
    : variants;

  return nestedParts.flatMap((nestedPart) => {
    if (depth + 1 >= maxDepth) {
      return [nestedPart];
    }

    return flattenInlineIntersectionParts(
      nestedPart,
      logger,
      nestedAncestors,
      maxDepth,
      depth + 1,
    );
  });
}
