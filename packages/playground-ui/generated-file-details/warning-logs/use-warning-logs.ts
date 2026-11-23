import type {
  GraphPayloadItemNode,
  GraphPayloadLog,
  GraphPayloadNode,
} from '@codegena/graph-core';
import { useMemo } from 'react';

export function useWarningLogs(
  graphNodes: GraphPayloadNode[],
  visibleFileIds: ReadonlySet<string>,
  allLogs: GraphPayloadLog[],
  shouldShowAllFiles: boolean,
): GraphPayloadLog[] {
  return useMemo(() => {
    const logs = shouldShowAllFiles
      ? allLogs
      : graphNodes
          .filter((node): node is GraphPayloadItemNode => (
            node.data.kind === 'item'
            && 'parentId' in node
            && typeof node.parentId === 'string'
            && visibleFileIds.has(node.parentId)
          ))
          .flatMap(({ data }) => data.logs);

    return logs.filter(({ level }) => level === 'warn' || level === 'error');
  }, [
    allLogs,
    graphNodes,
    shouldShowAllFiles,
    visibleFileIds,
  ]);
}
