import type {
  TransitiveNode,
  UnknownTransitiveNode,
} from '../transitive-node';

export function createNeverUnknownTransitiveNode(
  propertyName: string,
  sourceTransitiveNode: TransitiveNode,
): UnknownTransitiveNode {
  return {
    associatedPropertyName: propertyName,
    isNever: true,
    source: sourceTransitiveNode.source,
    type: 'unknown',
  };
}
