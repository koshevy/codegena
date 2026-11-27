import type { UltimateParserVisitorResult } from '@codegena/oas3-core/ultimate-parser';

import type { GraphPayloadEdge } from '../graph-payload-edge';
import type {
  GraphPayloadGroupNode,
  GraphPayloadNode,
} from '../graph-payload-node';
import { createDirectoryHierarchy } from './create-directory-hierarchy';

interface PlacedGraphPayload<TAstObject extends object> {
  edges: GraphPayloadEdge[];
  nodes: GraphPayloadNode<TAstObject>[];
}

export function placeGraphPayloadDirectories<TAstObject extends object>(
  nodes: GraphPayloadNode<TAstObject>[],
  idsByItem: Map<UltimateParserVisitorResult<TAstObject>, string>,
): PlacedGraphPayload<TAstObject> {
  const hasOpenApiEntrypoint = idsByItem.keys().some(({ transitiveNode }) => (
    transitiveNode.type === 'openApiDocument'
    || transitiveNode.type === 'entrypointRecord'
  ));

  if (!hasOpenApiEntrypoint) {
    return { edges: [], nodes };
  }

  const groups = nodes.filter((node): node is GraphPayloadGroupNode => (
    node.data.kind === 'group'
  ));
  const hierarchy = createDirectoryHierarchy(groups);
  const placedGroupsById = new Map(hierarchy.groups.map((group) => [
    group.id,
    group,
  ]));
  const placedNodes = nodes.map((node) => (
    node.data.kind === 'group'
      ? placedGroupsById.get(node.id) ?? node
      : node
  ));

  return {
    edges: hierarchy.edges,
    nodes: [...hierarchy.directories, ...placedNodes],
  };
}
