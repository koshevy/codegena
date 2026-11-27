import type { GraphPayloadLog } from '@codegena/graph-core';
import { useMemo } from 'react';

import { getWarningKey } from './get-warning-key';

function compareWarningLogs(first: GraphPayloadLog, second: GraphPayloadLog): number {
  const firstLine = first.jsoncNode?.line ?? Number.POSITIVE_INFINITY;
  const secondLine = second.jsoncNode?.line ?? Number.POSITIVE_INFINITY;

  if (firstLine !== secondLine) {
    return firstLine - secondLine;
  }

  return (first.jsoncNode?.fileName ?? '').localeCompare(
    second.jsoncNode?.fileName ?? '',
  ) || (first.jsoncNode?.col ?? 0) - (second.jsoncNode?.col ?? 0);
}

export function useUniqueWarningLogs(
  warningLogs: GraphPayloadLog[],
  focusedWarning?: GraphPayloadLog,
): GraphPayloadLog[] {
  return useMemo(() => {
    const uniqueWarningLogs = warningLogs.reduce((byKey, log) => (
      byKey.set(getWarningKey(log), log)
    ), new Map<string, GraphPayloadLog>());

    if (focusedWarning) {
      uniqueWarningLogs.set(getWarningKey(focusedWarning), focusedWarning);
    }

    return [...uniqueWarningLogs.values()].toSorted(compareWarningLogs);
  }, [
    warningLogs,
    focusedWarning,
  ]);
}
