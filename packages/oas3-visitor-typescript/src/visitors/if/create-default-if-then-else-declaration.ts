import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  doAdditionOfTransitiveNodes,
  subtractTransitiveNode,
} from '@codegena/oas3-core/transitive-parser';
import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import {
  createConditionalSourceNodeSet,
} from './create-conditional-source-node-set';
import { createConditionalVariantNode } from './create-conditional-variant-node';
import {
  createUnionWithSharedIntersection,
} from './create-union-with-shared-intersection';
import { getConditionalPartType } from './get-conditional-part-type';
import type { VisitorIfProps } from './visitor-if-props';
import { createFallbackType } from '../../ast-utils';
import { createTypescriptTypeAliasVisitorResult } from '../../misc-utils';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';

/**
 * Creates the default union declaration for an `if`/`then`/`else` schema.
 */
export function createDefaultIfThenElseDeclaration({
  getAnotherByTransitiveNode,
  logger,
  suggestedName,
  transitiveNode,
}: VisitorIfProps): TypescriptParserVisitorResult {
  const sourceNodes = createConditionalSourceNodeSet(transitiveNode);
  const condition = typeof transitiveNode.condition === 'string'
    ? null
    : transitiveNode.condition;

  const positiveVariant = addTransitiveNodes([
    transitiveNode.mixin,
    condition,
    transitiveNode.positiveResult,
  ]);

  const baseWithoutCondition = condition && transitiveNode.mixin
    ? subtractTransitiveNode(transitiveNode.mixin, condition)
    : transitiveNode.mixin;

  const negativeVariant = addTransitiveNodes([
    baseWithoutCondition,
    transitiveNode.negativeResult,
  ]);

  const positiveType = getVariantType(
    createVariantNode(positiveVariant, 'positive', sourceNodes),
    { getAnotherByTransitiveNode, transitiveNode },
  );

  const negativeType = getVariantType(
    createVariantNode(negativeVariant, 'negative', sourceNodes),
    { getAnotherByTransitiveNode, transitiveNode },
  );

  const typeNode = createUnionWithSharedIntersection(
    positiveType,
    negativeType,
  );

  return createTypescriptTypeAliasVisitorResult({
    fallbackNameAspect: 'ConditionalType',
    logger,
    suggestedName,
    transitiveNode,
    typeNode,
  });
}

function addTransitiveNodes(
  transitiveNodes: (TransitiveNode | null | undefined)[],
): TransitiveNode | null {
  const [firstTransitiveNode, ...restTransitiveNodes] = transitiveNodes.filter(
    (transitiveNode): transitiveNode is TransitiveNode => !!transitiveNode,
  );

  if (!firstTransitiveNode) {
    return null;
  }

  return restTransitiveNodes.reduce(
    (result, transitiveNode) => (
      doAdditionOfTransitiveNodes(result, transitiveNode)
    ),
    firstTransitiveNode,
  );
}

function getVariantType(
  transitiveNode: TransitiveNode | null,
  props: Pick<VisitorIfProps, 'getAnotherByTransitiveNode' | 'transitiveNode'>,
): TypeNode {
  if (transitiveNode?.isNever) {
    return factory.createKeywordTypeNode(SyntaxKind.NeverKeyword);
  }

  return getConditionalPartType({
    fallback: createFallbackType(),
    ...props,
    part: transitiveNode,
  });
}

function createVariantNode(
  transitiveNode: TransitiveNode | null,
  cacheKey: string,
  sourceNodes: Set<TransitiveNode>,
): TransitiveNode | null {
  if (!transitiveNode) {
    return null;
  }

  return createConditionalVariantNode(transitiveNode, cacheKey, sourceNodes);
}
