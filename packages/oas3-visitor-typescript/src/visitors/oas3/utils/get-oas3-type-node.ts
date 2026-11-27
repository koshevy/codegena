import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { factory, SyntaxKind, type TypeNode } from 'typescript';

import { extractTransitiveNodeIdentifier } from '../../../ast-utils';
import type { VisitorFnProps } from '../../../typescript-parser-visitor-fn';

export function getOas3TypeNode(
  node: TransitiveNode | undefined,
  getAnotherByTransitiveNode: VisitorFnProps['getAnotherByTransitiveNode'],
  owner: TransitiveNode,
): TypeNode {
  if (!node) {
    return factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
  }

  const result = getAnotherByTransitiveNode(node);

  return extractTransitiveNodeIdentifier(node, result, owner);
}
