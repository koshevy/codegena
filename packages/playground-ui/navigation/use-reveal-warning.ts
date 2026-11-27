import type { GraphPayload, GraphPayloadLog } from '@codegena/graph-core';
import { useCallback } from 'react';

import { findRelatedWarningItem } from './find-related-warning-item';

export function useRevealWarning(
  graph: GraphPayload,
  revealNode: (nodeId: string, shouldRevealFile?: boolean) => void,
  showWarnings: (log: GraphPayloadLog, shouldHighlight?: boolean) => void,
): (log: GraphPayloadLog) => void {
  return useCallback((log): void => {
    const relatedItem = findRelatedWarningItem(graph, log);

    if (relatedItem) {
      revealNode(relatedItem.id, false);
    }

    showWarnings(log, true);
  }, [
    graph,
    revealNode,
    showWarnings,
  ]);
}
