import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

export function hasInlineTransitiveNodes(
  transitiveNodes: TransitiveNode[],
): boolean {
  return transitiveNodes.some(({ isInline, type }) => (
    isInline && type === 'structure'
  ));
}
