import {
  isIdentifier,
  isIntersectionTypeNode,
  isLiteralTypeNode,
  isQualifiedName,
  isTemplateLiteralTypeNode,
  isTypeReferenceNode,
  type EntityName,
  isUnionTypeNode,
  type LiteralTypeNode,
  type NodeArray,
  type TemplateLiteralTypeSpan,
  type TypeNode,
} from 'typescript';

export function areNodeArraysEqual<T extends TypeNode>(
  first?: NodeArray<T>,
  second?: NodeArray<T>,
  areItemsEqual: (..._: [T, T]) => boolean = areTypesSimplyEqual,
): boolean {
  if (first === second) {
    return true;
  }

  if (!first || !second) {
    return false;
  }

  if (first.length !== second.length) {
    return false;
  }

  for (const [index, element] of first.entries()) {
    if (!areItemsEqual(element, second[index])) {
      return false;
    }
  }

  return true;
}

function areEntityNamesEqual(first: EntityName, second: EntityName): boolean {
  if (isIdentifier(first) && isIdentifier(second)) {
    return first.text === second.text;
  }

  if (isQualifiedName(first) && isQualifiedName(second)) {
    return first.right.text === second.right.text
      && areEntityNamesEqual(first.left, second.left);
  }

  return false;
}

function areLiteralTypesEqual(
  first: LiteralTypeNode,
  second: LiteralTypeNode,
): boolean {
  const firstLiteral = first.literal;
  const secondLiteral = second.literal;

  if (firstLiteral.kind !== secondLiteral.kind) {
    return false;
  }

  if ('text' in firstLiteral && 'text' in secondLiteral) {
    return firstLiteral.text === secondLiteral.text;
  }

  if ('operator' in firstLiteral && 'operator' in secondLiteral) {
    const firstOperand = firstLiteral.operand;
    const secondOperand = secondLiteral.operand;

    return firstLiteral.operator === secondLiteral.operator
      && firstOperand.kind === secondOperand.kind
      && 'text' in firstOperand
      && 'text' in secondOperand
      && firstOperand.text === secondOperand.text;
  }

  return true;
}

function areTemplateSpansEqual(
  first: TemplateLiteralTypeSpan,
  second: TemplateLiteralTypeSpan,
): boolean {
  return (first.literal.text === second.literal.text
    && first.literal.kind === second.literal.kind
    && areTypesSimplyEqual(first.type, second.type)
  );
}

export function areTypesSimplyEqual(
  first: TypeNode, second: TypeNode,
): boolean {
  if (first === second) {
    return true;
  }

  if ((isUnionTypeNode(first) && isUnionTypeNode(second))
    || (isIntersectionTypeNode(first) && isIntersectionTypeNode(second))
  ) {
    return areNodeArraysEqual(first.types, second.types);
  }

  if (isTypeReferenceNode(first) && isTypeReferenceNode(second)) {
    if (!areEntityNamesEqual(first.typeName, second.typeName)) {
      return false;
    }

    return areNodeArraysEqual(first.typeArguments, second.typeArguments);
  }

  if (isTemplateLiteralTypeNode(first) && isTemplateLiteralTypeNode(second)) {
    if (first.head.text !== second.head.text) {
      return false;
    }

    return areNodeArraysEqual(
      first.templateSpans,
      second.templateSpans,
      areTemplateSpansEqual,
    );
  }

  if (isLiteralTypeNode(first) && isLiteralTypeNode(second)) {
    return areLiteralTypesEqual(first, second);
  }

  return first.kind === second.kind;
}
