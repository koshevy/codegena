import {
  factory,
  type TypeNode,
} from 'typescript';

import { createConditionalResultType } from '../../ast-utils';

export type ConditionalPart = 'base' | 'if' | 'then' | 'else' | 'result';

export interface ConditionalPartDefinition {
  conditionalPart: ConditionalPart;
  partType: TypeNode;
}

export function createConditionalPartLiteral(
  conditionalPart: ConditionalPart,
): TypeNode {
  return factory.createLiteralTypeNode(
    factory.createStringLiteral(conditionalPart),
  );
}

export function createConditionalPartSelector(
  conditionalPart: ConditionalPart,
  partType: TypeNode,
  nextPart: TypeNode,
): TypeNode {
  return factory.createConditionalTypeNode(
    factory.createTypeReferenceNode('TPart'),
    createConditionalPartLiteral(conditionalPart),
    partType,
    nextPart,
  );
}

export function createConditionalResultTypeReference(
  typeName: string,
  conditionPart: ConditionalPart,
  positivePart: ConditionalPart,
  negativePart: ConditionalPart,
): TypeNode {
  return factory.createTypeReferenceNode(
    createConditionalResultType().name,
    [
      createConditionalPartReference(typeName, 'base'),
      factory.createTypeReferenceNode('TRealPart'),
      createConditionalPartReference(typeName, conditionPart),
      createConditionalPartReference(typeName, positivePart),
      createConditionalPartReference(typeName, negativePart),
    ],
  );
}

function createConditionalPartReference(
  typeName: string,
  conditionalPart: ConditionalPart,
): TypeNode {
  return factory.createTypeReferenceNode(typeName, [
    createConditionalPartLiteral(conditionalPart),
    factory.createTypeReferenceNode('TRealPart'),
  ]);
}
