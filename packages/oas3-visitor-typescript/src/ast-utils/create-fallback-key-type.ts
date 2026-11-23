import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

export function createFallbackKeyType(): TypeNode {
  return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
}
