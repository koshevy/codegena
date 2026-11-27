import type { DeclarationType } from '@codegena/oas3-core/ultimate-parser';
import {
  isArrayTypeNode,
  isIdentifier,
  isInterfaceDeclaration,
  isIntersectionTypeNode,
  isLiteralTypeNode,
  isMappedTypeNode,
  isModuleDeclaration,
  isParenthesizedTypeNode,
  isTemplateLiteralTypeNode,
  isTupleTypeNode,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isTypeOperatorNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  SyntaxKind,
  type Node,
  type TypeNode,
} from 'typescript';

export function getTypeScriptDeclarationType(
  ast: Node,
): DeclarationType | undefined {
  if (isInterfaceDeclaration(ast)) {
    return 'Interface';
  }

  if (isModuleDeclaration(ast)) {
    return 'Namespace';
  }

  if (!isTypeAliasDeclaration(ast)) {
    return undefined;
  }

  let type: TypeNode = ast.type;

  while (isParenthesizedTypeNode(type)) {
    type = type.type;
  }

  if (isTypeOperatorNode(type) && type.operator === SyntaxKind.ReadonlyKeyword) {
    type = type.type;
  }

  if (isUnionTypeNode(type)) {
    return 'Union';
  }

  if (isIntersectionTypeNode(type)) {
    return 'Intersection';
  }

  if (isArrayTypeNode(type)
    || isTupleTypeNode(type)
    || isNamedTypeReference(type, 'Array')
    || isNamedTypeReference(type, 'ReadonlyArray')
  ) {
    return 'Array';
  }

  if (isTypeLiteralNode(type)
    || isMappedTypeNode(type)
    || isNamedTypeReference(type, 'Record')
  ) {
    return 'Record';
  }

  if (isLiteralTypeNode(type) && type.literal.kind === SyntaxKind.NullKeyword) {
    return 'Scalar';
  }

  if (isTemplateLiteralTypeNode(type) || isLiteralTypeNode(type)) {
    return 'Literal';
  }

  if (isScalarKeyword(type.kind)) {
    return 'Scalar';
  }

  return 'Alias';
}

function isNamedTypeReference(type: TypeNode, name: string): boolean {
  return isTypeReferenceNode(type)
    && isIdentifier(type.typeName)
    && type.typeName.text === name;
}

function isScalarKeyword(kind: SyntaxKind): boolean {
  switch (kind) {
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.BigIntKeyword:
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.NeverKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.ObjectKeyword:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.SymbolKeyword:
    case SyntaxKind.UndefinedKeyword:
    case SyntaxKind.UnknownKeyword:
    case SyntaxKind.VoidKeyword:
      return true;
    default:
      return false;
  }
}
