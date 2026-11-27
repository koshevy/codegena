import type { GraphPayload, GraphPayloadNode } from '@codegena/graph-core';

import type { GraphSearchDocument } from '../documents';
import { countGraphEdgesByRelation } from './count-graph-edges-by-relation';
import { mapGraphSearchDocumentToScore } from './map-graph-search-document-to-score';

export function scoreGraphSearchDocuments(
  graphPayload: GraphPayload,
  documents: GraphSearchDocument[],
  childrenByParent: Map<string | undefined, GraphPayloadNode[]>,
): Map<string, number> {
  const edgeCounts = countGraphEdgesByRelation(graphPayload.edges);
  const context = { childrenByParent, edgeCounts };
  const entries = documents.map((document) => (
    mapGraphSearchDocumentToScore(document, context)
  ));

  return new Map(entries);
}
