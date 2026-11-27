import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

export interface ConditionalTypeCase {
  key: string;
  type: TypeNode;
}

export function createLiteralType(key: string): TypeNode {
  const value = /^\d+$/.test(key)
    ? factory.createNumericLiteral(Number(key))
    : factory.createStringLiteral(key);

  return factory.createLiteralTypeNode(value);
}

export function createKeyConstraint(keys: string[]): TypeNode {
  const literals = keys.map((item) => createLiteralType(item));

  if (!literals.length) {
    return factory.createKeywordTypeNode(SyntaxKind.NeverKeyword);
  }

  return literals.length === 1
    ? literals[0]
    : factory.createUnionTypeNode(literals);
}

export function createConditionalType(
  parameterName: string,
  cases: ConditionalTypeCase[],
  fallback: TypeNode = factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
): TypeNode {
  return cases.reduceRight<TypeNode>((otherwise, entry) => (
    factory.createConditionalTypeNode(
      factory.createTypeReferenceNode(parameterName),
      createLiteralType(entry.key),
      entry.type,
      otherwise,
    )
  ), fallback);
}
