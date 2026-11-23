import {
  factory,
  type TypeAliasDeclaration,
} from 'typescript';

const conditionalResultTypeCache: { current?: TypeAliasDeclaration } = {};

export function createConditionalResultType(): TypeAliasDeclaration {
  if (conditionalResultTypeCache.current) {
    return conditionalResultTypeCache.current;
  }

  const basePart = factory.createTypeParameterDeclaration(
    undefined,
    'TBasePart',
  );

  const realPart = factory.createTypeParameterDeclaration(
    undefined,
    'TRealPart',
    factory.createTypeReferenceNode(basePart.name),
  );

  const conditionPart = factory.createTypeParameterDeclaration(
    undefined,
    'TConditionPart',
  );

  const positiveCase = factory.createTypeParameterDeclaration(
    undefined,
    'TPositiveCase',
  );

  const negativeCase = factory.createTypeParameterDeclaration(
    undefined,
    'TNegativeCase',
  );

  const conditionalCase = factory.createConditionalTypeNode(
    factory.createTypeReferenceNode(realPart.name),
    factory.createTypeReferenceNode(conditionPart.name),
    factory.createTypeReferenceNode(positiveCase.name),
    factory.createTypeReferenceNode(negativeCase.name),
  );

  const conditionalResultType = factory.createTypeAliasDeclaration(
    undefined,
    'ConditionalResultType',
    [
      basePart,
      realPart,
      conditionPart,
      positiveCase,
      negativeCase,
    ],
    factory.createIntersectionTypeNode([
      factory.createTypeReferenceNode(realPart.name),
      factory.createParenthesizedType(conditionalCase),
    ]),
  );

  conditionalResultTypeCache.current = conditionalResultType;

  return conditionalResultType;
}
