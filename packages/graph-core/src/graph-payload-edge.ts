export type GraphPayloadEdgeRelation = 'import' | 'placement' | 'reference';

export interface GraphPayloadEdge {
  data: { relation: GraphPayloadEdgeRelation };
  id: string;
  label: GraphPayloadEdgeRelation;
  source: string;
  target: string;
}
