import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import uniqWith from 'lodash/uniqWith';
import {
  type ExpressionWithTypeArguments,
  factory,
  SyntaxKind,
} from 'typescript';

import { areTypesSimplyEqual } from '../../ast-utils';

export function extractReferredIdentifiers(
  referredTransitiveNodes: TransitiveNode[],
): ExpressionWithTypeArguments[] {
  const nonUniqueValues = referredTransitiveNodes.map((refTransitiveNode) => {
    const refName = refTransitiveNode.name ?? refTransitiveNode.suggestedName;

    if (!refName) {
      return factory.createExpressionWithTypeArguments(
        factory.createIdentifier('Record'),
        [
          factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
        ],
      );
    }

    return factory.createExpressionWithTypeArguments(
      factory.createIdentifier(refName),
      undefined,
    );
  });

  return uniqWith(nonUniqueValues, areTypesSimplyEqual);
}
