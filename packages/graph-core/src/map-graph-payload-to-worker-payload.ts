import type { GraphPayload } from './graph-payload';
import type { GraphPayloadNode } from './graph-payload-node';

function mapGraphNodeToWorkerNode(node: GraphPayloadNode): GraphPayloadNode {
  if (!('extent' in node)) {
    return node;
  }

  return {
    ...node,
    data: {
      ...node.data,
      ast: {},
    },
  };
}

/**
 * Keep graph data needed by views while removing visitor AST objects that
 * cannot cross a worker message boundary.
 */
export function mapGraphPayloadToWorkerPayload(
  graphPayload: GraphPayload,
): GraphPayload {
  return {
    ...graphPayload,
    nodes: graphPayload.nodes.map((node) => (
      mapGraphNodeToWorkerNode(node)
    )),
  };
}
