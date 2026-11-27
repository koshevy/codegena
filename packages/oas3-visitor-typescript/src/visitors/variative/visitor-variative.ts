import type { UnionTransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  factory,
  type TypeNode,
} from 'typescript';

import {
  createTypescriptTypeAliasVisitorResult,
  filterRedundantFallbackVariants,
} from '../../misc-utils';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';
import { getCombinedMemberType } from '../some-of/get-combined-member-type';

export const visitorVariative: TypescriptParserVisitorFn = ({
  getAnotherByTransitiveNode,
  logger,
  suggestedName,
  transitiveNode,
}) => {
  if (transitiveNode.type !== 'union'
    || !transitiveNode.isVariativeSchema
    || transitiveNode.not?.length
  ) {
    return null;
  }

  return createTypescriptTypeAliasVisitorResult({
    fallbackNameAspect: 'VariativeType',
    logger,
    suggestedName,
    transitiveNode,
    typeNode: createVariativeType(
      transitiveNode,
      getAnotherByTransitiveNode,
    ),
  });
};

function createVariativeType(
  transitiveNode: UnionTransitiveNode,
  getAnotherByTransitiveNode: Parameters<
    TypescriptParserVisitorFn
  >[0]['getAnotherByTransitiveNode'],
): TypeNode {
  const variants = filterRedundantFallbackVariants(
    transitiveNode.referredTransitiveNodes ?? [],
  );

  const types = variants.map((part) => getCombinedMemberType({
    getAnotherByTransitiveNode,
    part,
    transitiveNode,
  }));

  if (types.length === 1) {
    return types[0];
  }

  return factory.createUnionTypeNode(types);
}
