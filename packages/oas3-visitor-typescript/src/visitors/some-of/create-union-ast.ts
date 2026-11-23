import type { UnionTransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  factory,
  isUnionTypeNode,
  SyntaxKind,
  type Node as TsNode,
  type TypeNode,
} from 'typescript';

import {
  createCompleteOppositionVariant,
} from './create-complete-opposition-variant';
import {
  createExclusiveUnionVariant,
} from './create-exclusive-union-variant';
import {
  filterDirectRecursiveUnionMembers,
} from './filter-direct-recursive-union-members';
import { filterExcludedUnionVariants } from './filter-excluded-union-variants';
import { getCombinedMemberType } from './get-combined-member-type';
import { getRenderableVariants } from './get-renderable-variants';
import { resolveExclusiveUnionVariant } from './resolve-exclusive-union-variant';
import {
  createFallbackType,
  createTypeAliasDeclaration,
  deduplicateIdenticalTypeMembers,
} from '../../ast-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

export function createUnionAst(
  identifierName: string,
  logger: VisitorFnProps['logger'],
  transitiveNode: UnionTransitiveNode,
  getAnotherByTransitiveNode: VisitorFnProps['getAnotherByTransitiveNode'],
  options: VisitorFnProps['options'],
): TsNode {
  if (transitiveNode.not?.length
    && transitiveNode.isInline
    && (transitiveNode.name || transitiveNode.suggestedName)
  ) {
    const excludedTypes = transitiveNode.not.map((part) => (
      getCombinedMemberType({
        getAnotherByTransitiveNode,
        part,
        transitiveNode,
      })
    ));
    const excludedUnion = createUnionType(excludedTypes);

    return factory.createTypeReferenceNode('Exclude', [
      factory.createTypeReferenceNode(identifierName),
      excludedUnion,
    ]);
  }

  const oneOfMode = options?.oneOfMode ?? 'sameAsAnyOfForRefs';
  const useOpposition = transitiveNode.isExclusive
    && oneOfMode !== 'sameAsAnyOf';

  const variants = filterExcludedUnionVariants(
    getRenderableVariants(transitiveNode, logger),
    transitiveNode,
  );

  const resolvedVariants = useOpposition
    && oneOfMode === 'completeOpposition'
    ? variants.map((variant) => resolveExclusiveUnionVariant(variant, logger))
    : variants;

  const preparedVariants = resolvedVariants.map((variant) => {
    if (oneOfMode === 'completeOpposition' && useOpposition) {
      return createCompleteOppositionVariant(variant, resolvedVariants);
    }

    return useOpposition
      ? createExclusiveUnionVariant(variant, resolvedVariants)
      : variant;
  });

  const processedVariants = useOpposition && oneOfMode === 'completeOpposition'
    ? preparedVariants.filter((variant) => !variant.isNever)
    : preparedVariants;

  if (useOpposition
    && oneOfMode === 'completeOpposition'
    && !processedVariants.length
  ) {
    const neverType = factory.createKeywordTypeNode(SyntaxKind.NeverKeyword);

    return transitiveNode.isInline
      ? neverType
      : createTypeAliasDeclaration(identifierName, neverType);
  }

  const memberTypes = processedVariants.map((part) => getCombinedMemberType({
    getAnotherByTransitiveNode,
    part,
    transitiveNode,
  }));

  const hasMultipleReferenceMembers = processedVariants.length > 1
    && processedVariants.every((part) => part.type === 'reference');

  const unionType = hasMultipleReferenceMembers
    ? memberTypes
    : filterDirectRecursiveUnionMembers(identifierName, memberTypes);

  const uniqueUnionType = useOpposition
    ? unionType
    : deduplicateIdenticalTypeMembers(unionType);

  const type = createUnionType(uniqueUnionType);

  const typeWithMixin = transitiveNode.mixin
    ? factory.createIntersectionTypeNode([
        getCombinedMemberType({
          getAnotherByTransitiveNode,
          part: transitiveNode.mixin,
          transitiveNode,
        }),
        wrapUnionTypeForIntersection(type),
      ])
    : type;

  return transitiveNode.isInline
    ? typeWithMixin
    : createTypeAliasDeclaration(identifierName, typeWithMixin);
}

function createUnionType(memberTypes: TypeNode[]): TypeNode {
  if (!memberTypes.length) {
    return createFallbackType();
  }

  if (memberTypes.length === 1) {
    return memberTypes[0];
  }

  return factory.createUnionTypeNode(memberTypes);
}

function wrapUnionTypeForIntersection(type: TypeNode): TypeNode {
  if (!isUnionTypeNode(type)) {
    return type;
  }

  return factory.createParenthesizedType(type);
}
