import type { GraphPayloadLog } from '@codegena/graph-core';

export function getWarningKey(log: GraphPayloadLog): string {
  const location = log.jsoncNode;

  return [
    log.level,
    log.message,
    location?.fileName,
    location?.line,
    location?.col,
  ].join(':');
}
