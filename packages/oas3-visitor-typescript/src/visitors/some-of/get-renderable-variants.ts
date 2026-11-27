import { defaultLogger } from '@codegena/oas3-core/logger';
import type {
  CombinedTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import { applyArrayLengthConstraints } from './apply-array-length-constraints';
import {
  filterIncompatibleCombinedVariants,
} from './filter-incompatible-combined-variants';
import { filterRedundantFallbackVariants } from '../../misc-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

export function getRenderableVariants(
  transitiveNode: CombinedTransitiveNode,
  logger: VisitorFnProps['logger'],
): TransitiveNode[] {
  const compatibleVariants = filterIncompatibleCombinedVariants({
    logger: logger ?? defaultLogger,
    transitiveNode,
  });

  const variantsWithArrayLengths = transitiveNode.type === 'intersection'
    ? applyArrayLengthConstraints(compatibleVariants)
    : compatibleVariants;

  const renderableVariants = filterRedundantFallbackVariants(
    variantsWithArrayLengths,
  );

  if (transitiveNode.type !== 'intersection') {
    return renderableVariants;
  }

  return variantsWithArrayLengths.filter((variant) => (
    renderableVariants.includes(variant)
    || (
      variant.type === 'array'
      && variant.isFallbackType
      && (
        variant.minLength !== undefined
        || variant.maxLength !== undefined
      )
    )
  ));
}
