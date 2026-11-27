import type { IntersectionTransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  factory,
  isIdentifier,
  isTypeReferenceNode,
  SyntaxKind,
  type InterfaceDeclaration,
} from 'typescript';

import { getCombinedMemberType } from './get-combined-member-type';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';
import {
  extractPropertySignatures,
} from '../structure/extract-property-signatures';

export interface CreateAllOfInterfaceDeclarationProps extends Pick<
  VisitorFnProps,
  | 'getAnotherByTransitiveNode'
  | 'logger'
  | 'microContext'
> {

  identifierName: string;
  transitiveNode: IntersectionTransitiveNode;
}

/**
 * Uses interface inheritance when every allOf member is a named type and the
 * common schema part can become the interface body.
 */
export function createAllOfInterfaceDeclaration({
  getAnotherByTransitiveNode,
  identifierName,
  logger,
  microContext,
  transitiveNode,
}: CreateAllOfInterfaceDeclarationProps): InterfaceDeclaration | null {
  const { mixin } = transitiveNode;

  if (transitiveNode.isInline || mixin?.type !== 'structure') {
    return null;
  }

  const variants = transitiveNode.referredTransitiveNodes ?? [];

  if (!variants.length) {
    return null;
  }

  const memberTypes = variants.map((part) => getCombinedMemberType({
    getAnotherByTransitiveNode,
    part,
    transitiveNode,
  }));
  const namedMemberTypes = memberTypes.filter(isTypeReferenceNode);

  if (namedMemberTypes.length !== memberTypes.length) {
    return null;
  }

  const extendedTypes = namedMemberTypes.flatMap((memberType) => {
    if (!isIdentifier(memberType.typeName)) {
      return [];
    }

    return [factory.createExpressionWithTypeArguments(
      memberType.typeName,
      memberType.typeArguments,
    )];
  });

  if (extendedTypes.length !== namedMemberTypes.length) {
    return null;
  }

  const properties = extractPropertySignatures({
    getAnotherByTransitiveNode,
    logger,
    microContext,
    transitiveNode: mixin,
  });

  return factory.createInterfaceDeclaration(
    undefined,
    identifierName,
    undefined,
    [
      factory.createHeritageClause(
        SyntaxKind.ExtendsKeyword,
        extendedTypes,
      ),
    ],
    properties ?? [],
  );
}
