import {
  factory,
  SyntaxKind,
  type TypeReferenceNode,
} from 'typescript';

import { createFallbackType } from './create-fallback-type';

export function createFallbackObjectType(): TypeReferenceNode {
  return factory.createTypeReferenceNode('Record', [
    factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
    createFallbackType(),
  ]);
}
