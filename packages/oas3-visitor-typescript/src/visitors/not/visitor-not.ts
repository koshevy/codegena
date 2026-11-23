import { subtractTransitiveNode } from '@codegena/oas3-core/transitive-parser';

import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';

export const visitorNot: TypescriptParserVisitorFn = ({
  getAnotherByTransitiveNode,
  transitiveNode,
}) => {
  if (!transitiveNode.not?.length
    || transitiveNode.options?.['notProcessed']
  ) {
    return null;
  }

  const { not, ...baseNode } = transitiveNode;
  const subtractedNode = not.reduce(
    (currentNode, excludedNode) => subtractTransitiveNode(
      currentNode,
      excludedNode,
    ),
    baseNode,
  );

  const cacheKey = [
    'not-result',
    ...transitiveNode.source.jsonPath,
    ...not.map((node) => node.source.jsonPath.join('/')),
  ].join('/');

  const nameOverrides = transitiveNode.name || transitiveNode.suggestedName
    ? {
        name: transitiveNode.name,
        suggestedName: transitiveNode.suggestedName,
      }
    : {};

  const result = getAnotherByTransitiveNode({
    ...subtractedNode,
    ...nameOverrides,
    isInline: transitiveNode.isInline,
    options: {
      ...transitiveNode.options,
      ...subtractedNode.options,
      notProcessed: true,
      transitiveNodeCacheKey: cacheKey,
    },
  });

  return typeof result === 'function' ? null : result;
};
