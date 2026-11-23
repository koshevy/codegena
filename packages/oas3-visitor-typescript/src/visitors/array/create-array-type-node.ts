import { factory, isUnionTypeNode, type TypeNode } from 'typescript';

export function createArrayTypeNode(itemType: TypeNode): TypeNode {
  return factory.createArrayTypeNode(
    isUnionTypeNode(itemType)
      ? factory.createParenthesizedType(itemType)
      : itemType,
  );
}
