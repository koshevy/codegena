import type { GraphPayloadNode } from '@codegena/graph-core';

import type { GraphSearchDocument } from '../documents';
import type { GraphEdgeCounts } from './count-graph-edges-by-relation';

interface GraphSearchScoreContext {
  childrenByParent: Map<string | undefined, GraphPayloadNode[]>;
  edgeCounts: GraphEdgeCounts;
}

const severityOrder: readonly string[] = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
];

export function mapGraphSearchDocumentToScore(
  document: GraphSearchDocument,
  context: GraphSearchScoreContext,
): readonly [string, number] {
  const { id, suggestion } = document;
  const { childrenByParent, edgeCounts } = context;
  const nodeId = suggestion.nodeId ?? '';
  const children = childrenByParent.get(nodeId) ?? [];

  if (suggestion.kind === 'directory') {
    const directoryCount = children.filter(({ data }) => (
      data.kind === 'directory'
    )).length;
    const fileChildren = children.filter(({ data }) => (
      data.kind === 'group'
    ));
    const fileRelationCount = fileChildren.reduce((total, child) => (
      total + (edgeCounts.import.get(child.id) ?? 0)
    ), 0);

    return [id, directoryCount * 5 + fileChildren.length + fileRelationCount];
  }

  if (suggestion.kind === 'declaration') {
    return [id, edgeCounts.reference.get(nodeId) ?? 0];
  }

  if (suggestion.kind === 'file') {
    return [id, children.length];
  }

  if (suggestion.kind === 'warning') {
    const severityIndex = severityOrder.indexOf(document.warningLevel ?? '');

    return [id, Math.max(0, severityIndex)];
  }

  return [id, 0];
}
