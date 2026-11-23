import type { GraphPayloadLog } from '@codegena/graph-core';

export function getWarningLog(logs: GraphPayloadLog[]): GraphPayloadLog | undefined {
  return logs.find(({ level }) => level === 'warn' || level === 'error');
}
