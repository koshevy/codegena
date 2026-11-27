import type { GraphPayloadEdge } from './graph-payload-edge';
import type { GraphPayloadLog } from './graph-payload-log';
import type { GraphPayloadNode } from './graph-payload-node';

export interface GraphPayload<TAstObject extends object = object> {
  edges: GraphPayloadEdge[];
  logs: GraphPayloadLog[];
  nodes: GraphPayloadNode<TAstObject>[];
}
