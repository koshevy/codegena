import type { GraphPayloadLog } from '@codegena/graph-core';

export function getWarningMessage(log: GraphPayloadLog): string {
  return log.message.split('Encountered at:')[0].trim();
}
