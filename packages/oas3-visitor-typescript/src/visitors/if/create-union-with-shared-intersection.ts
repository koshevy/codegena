import {
  factory,
  isIntersectionTypeNode,
  type TypeNode,
} from 'typescript';

import { getPrintedTypeNodeText } from '../../ast-utils';

/** Factors identical intersection members out of two union branches. */
export function createUnionWithSharedIntersection(
  positiveType: TypeNode,
  negativeType: TypeNode,
): TypeNode {
  const unionType = factory.createUnionTypeNode([
    positiveType,
    negativeType,
  ]);

  if (!isIntersectionTypeNode(positiveType)
    || !isIntersectionTypeNode(negativeType)
  ) {
    return unionType;
  }

  const negativeParts = [...negativeType.types];
  const positiveParts: TypeNode[] = [];
  const sharedParts: TypeNode[] = [];

  for (const positivePart of positiveType.types) {
    const positiveText = getPrintedTypeNodeText(positivePart);

    const matchingIndex = negativeParts.findIndex((negativePart) => (
      getPrintedTypeNodeText(negativePart) === positiveText
    ));

    if (matchingIndex === -1) {
      positiveParts.push(positivePart);

      continue;
    }

    sharedParts.push(positivePart);
    negativeParts.splice(matchingIndex, 1);
  }

  if (!sharedParts.length || !positiveParts.length || !negativeParts.length) {
    return unionType;
  }

  const branchUnionType = factory.createUnionTypeNode([
    createIntersectionTypeIfNeeded(positiveParts),
    createIntersectionTypeIfNeeded(negativeParts),
  ]);

  return factory.createIntersectionTypeNode([
    ...sharedParts,
    factory.createParenthesizedType(branchUnionType),
  ]);
}

function createIntersectionTypeIfNeeded(types: TypeNode[]): TypeNode {
  return types.length === 1
    ? types[0]
    : factory.createIntersectionTypeNode(types);
}
