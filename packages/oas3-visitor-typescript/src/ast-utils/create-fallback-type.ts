import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

export function createFallbackType(): TypeNode {
  return factory.createKeywordTypeNode(
    SyntaxKind.UnknownKeyword,
  );
}
