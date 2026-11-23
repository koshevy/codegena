import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import type { TypeNode } from 'typescript';

import {
  createFallbackObjectType,
  extractTransitiveNodeIdentifier,
} from '../../ast-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

export interface ConvertReferredTypesProps extends Pick<
  VisitorFnProps,
  | 'transitiveNode'
  | 'getAnotherByTransitiveNode'
> {
  processRefsAsNamed?: boolean;
  referredTransitiveNodes: TransitiveNode[];
}

export function extractReferredTypes({
  transitiveNode,
  getAnotherByTransitiveNode,
  processRefsAsNamed,
  referredTransitiveNodes,
}: ConvertReferredTypesProps): TypeNode[] {
  return referredTransitiveNodes.map(
    (refTransitiveNode) => {
      if (refTransitiveNode.type !== 'structure') {
        return createFallbackObjectType();
      }

      const refResult = getAnotherByTransitiveNode({
        ...refTransitiveNode,
        isInline: !processRefsAsNamed,
      });

      if (processRefsAsNamed || typeof refResult === 'function') {
        return extractTransitiveNodeIdentifier(
          refTransitiveNode,
          refResult,
          transitiveNode,
        );
      }

      return refResult.ast as TypeNode;
    },
  );
}
