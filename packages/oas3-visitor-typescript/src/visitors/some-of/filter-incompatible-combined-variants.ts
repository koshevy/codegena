import type { Logger } from '@codegena/oas3-core/logger';
import type {
  CombinedTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import { getNodeErrorText } from '@codegena/oas3-core/transitive-parser';

import { getTerminalNodeTypes } from '../../misc-utils';

export interface FilterIncompatibleCombinedVariantsProps {
  logger: Logger;
  transitiveNode: CombinedTransitiveNode;
}

export function filterIncompatibleCombinedVariants({
  logger,
  transitiveNode,
}: FilterIncompatibleCombinedVariantsProps): TransitiveNode[] {
  const variants = transitiveNode.referredTransitiveNodes ?? [];

  if (!transitiveNode.mixin) {
    return variants;
  }

  const mixinTypes = getTerminalNodeTypes(transitiveNode.mixin);

  return variants.filter((variant) => {
    const variantTypes = getTerminalNodeTypes(variant);
    const hasMismatch = [...variantTypes].some((variantType) => (
      !mixinTypes.has(variantType)
    ));

    if (!hasMismatch) {
      return true;
    }

    logger.warn(
      { node: variant.source.node },
      [
        'Ignored incompatible combined-schema variant.',
        `Expected terminal node types compatible with: ${[...mixinTypes].join(', ')}.`,
        `Received terminal node types: ${[...variantTypes].join(', ')}.`,
        getNodeErrorText(
          variant.source.getOriginalFileContent(),
          variant.source.node,
          variant.source.sourceFileId,
        ),
      ].join('\n'),
    );

    return false;
  });
}
