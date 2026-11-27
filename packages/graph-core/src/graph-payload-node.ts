import type { GraphPayloadDirectoryNodeData } from './graph-payload-directory-node-data';
import type { GraphPayloadGroupNodeData } from './graph-payload-group-node-data';
import type { GraphPayloadItemNodeData } from './graph-payload-item-node-data';

export type GraphPayloadNodeData<TAstObject extends object = object> = (
  GraphPayloadDirectoryNodeData
  | GraphPayloadGroupNodeData
  | GraphPayloadItemNodeData<TAstObject>
);

export interface GraphPayloadDirectoryNode {
  data: GraphPayloadDirectoryNodeData;
  id: string;
  parentId?: string;
  type: 'directory';
}

export interface GraphPayloadGroupNode {
  data: GraphPayloadGroupNodeData;
  id: string;
  parentId?: string;
  type: 'default';
}

export interface GraphPayloadItemNode<TAstObject extends object = object> {
  data: GraphPayloadItemNodeData<TAstObject>;
  extent: 'parent';
  id: string;
  parentId: string;
}

export type GraphPayloadNode<TAstObject extends object = object> = (
  GraphPayloadDirectoryNode
  | GraphPayloadGroupNode
  | GraphPayloadItemNode<TAstObject>
);
