import type { IntersectionTransitiveNode } from '@codegena/oas3-core/transitive-node';
import { factory, type TypeNode } from 'typescript';

import { getCombinedMemberType } from './get-combined-member-type';
import {
  createFallbackType,
  deduplicateIdenticalTypeMembers,
} from '../../ast-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

export function createIntersectionType(
  transitiveNode: IntersectionTransitiveNode,
  getAnotherByTransitiveNode: VisitorFnProps['getAnotherByTransitiveNode'],
): TypeNode {
  const memberTypes = transitiveNode.referredTransitiveNodes?.map((part) => (
    getCombinedMemberType({
      getAnotherByTransitiveNode,
      part,
      transitiveNode,
    })
  )) ?? [];

  if (transitiveNode.mixin) {
    memberTypes.unshift(getCombinedMemberType({
      getAnotherByTransitiveNode,
      part: transitiveNode.mixin,
      transitiveNode,
    }));
  }

  const uniqueMemberTypes = deduplicateIdenticalTypeMembers(memberTypes);

  if (!uniqueMemberTypes.length) {
    return createFallbackType();
  }

  if (uniqueMemberTypes.length === 1) {
    return uniqueMemberTypes[0];
  }

  return factory.createIntersectionTypeNode(uniqueMemberTypes);
}
