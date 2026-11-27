import kebabCase from 'lodash/kebabCase';
import {
  factory,
  Node as TsNode,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import {
  createConditionalPartLiteral,
  createConditionalPartSelector,
  createConditionalResultTypeReference,
  type ConditionalPartDefinition,
} from './conditional-part-utils';
import { addConditionalResultToMicroContext } from './create-conditional-result';
import { getConditionalPartType } from './get-conditional-part-type';
import type { VisitorIfProps } from './visitor-if-props';
import {
  createAstToString,
  createFallbackObjectType,
  createFallbackType,
} from '../../ast-utils';
import { createTypeIdentifierName } from '../../misc-utils';
import { programmingLanguageInfo } from '../../programming-language-info';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';

/**
 * Creates a generic declaration that lets consumers select a conditional part.
 */
export function createConditionalIfThenElseDeclaration({
  getAnotherByTransitiveNode,
  logger,
  microContext = { shouldBeGroupedWith: [] },
  suggestedName,
  transitiveNode,
}: VisitorIfProps): TypescriptParserVisitorResult {
  const identifierName = createTypeIdentifierName({
    name: transitiveNode.name,
    suggestedName: suggestedName ?? transitiveNode.suggestedName,
    fallbackNameAspect: 'ConditionalType',
    logger,
  });

  const basePart = getConditionalPartType({
    fallback: createFallbackObjectType(),
    getAnotherByTransitiveNode,
    part: transitiveNode.mixin,
    transitiveNode,
  });

  const ifPart = getConditionalPartType({
    fallback: createFallbackType(),
    getAnotherByTransitiveNode,
    part: transitiveNode.condition,
    transitiveNode,
  });

  const thenPart = getConditionalPartType({
    fallback: basePart,
    getAnotherByTransitiveNode,
    part: transitiveNode.positiveResult,
    transitiveNode,
  });

  const elsePart = getConditionalPartType({
    fallback: basePart,
    getAnotherByTransitiveNode,
    part: transitiveNode.negativeResult,
    transitiveNode,
  });
  const conditionPartName = transitiveNode.condition ? 'if' : 'base';
  const positivePartName = transitiveNode.positiveResult ? 'then' : 'base';
  const negativePartName = transitiveNode.negativeResult ? 'else' : 'base';
  const resultPart = createConditionalResultTypeReference(
    identifierName,
    conditionPartName,
    positivePartName,
    negativePartName,
  );
  const neverPart = factory.createKeywordTypeNode(SyntaxKind.NeverKeyword);
  const conditionalPartDefinitions: ConditionalPartDefinition[] = [
    {
      conditionalPart: 'base',
      partType: basePart,
    },
  ];

  if (transitiveNode.condition) {
    conditionalPartDefinitions.push({
      conditionalPart: 'if',
      partType: ifPart,
    });
  }

  if (transitiveNode.positiveResult) {
    conditionalPartDefinitions.push({
      conditionalPart: 'then',
      partType: thenPart,
    });
  }

  if (transitiveNode.negativeResult) {
    conditionalPartDefinitions.push({
      conditionalPart: 'else',
      partType: elsePart,
    });
  }

  conditionalPartDefinitions.push({
    conditionalPart: 'result',
    partType: resultPart,
  });

  const conditionalType = conditionalPartDefinitions.reduceRight<TypeNode>(
    (nextPart, {
      conditionalPart,
      partType,
    }) => createConditionalPartSelector(
      conditionalPart,
      partType,
      nextPart,
    ),
    neverPart,
  );

  const conditionalParts = conditionalPartDefinitions.map(({ conditionalPart }) => (
    createConditionalPartLiteral(conditionalPart)
  ));

  const partConstraint = factory.createUnionTypeNode(conditionalParts);
  const partParameter = factory.createTypeParameterDeclaration(
    undefined,
    'TPart',
    partConstraint,
  );

  const realPartReference = factory.createTypeReferenceNode(identifierName, [
    createConditionalPartLiteral('base'),
    factory.createTypeReferenceNode('TRealPart'),
  ]);

  const realPartParameter = factory.createTypeParameterDeclaration(
    undefined,
    'TRealPart',
    realPartReference,
    basePart,
  );

  const ast: TsNode = factory.createTypeAliasDeclaration(
    undefined,
    identifierName,
    [partParameter, realPartParameter],
    conditionalType,
  );
  const relativeFilePath = `${kebabCase(identifierName)}.ts`;

  addConditionalResultToMicroContext(microContext, transitiveNode);

  const toString = createAstToString(ast, relativeFilePath);

  return {
    ...programmingLanguageInfo,
    ast,
    relativeFilePath,
    transitiveNode,
    toString,
  };
}
