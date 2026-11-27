import type { CollectedLog } from '@codegena/oas3-core/logger';

import type { GraphPayloadLog } from '../graph-payload-log';

export interface GraphPayloadLogEntry {
  log: GraphPayloadLog;
  sourceOffset?: number;
}

export function mapCollectedLogToGraphPayloadLogEntry(
  input: CollectedLog,
): GraphPayloadLogEntry {
  const { error, jsoncNode, level, message, node } = input;

  return {
    log: {
      ...(error && {
        error: {
          message: error.message,
          name: error.name,
          ...(error.stack && { stack: error.stack }),
        },
      }),
      ...(jsoncNode && { jsoncNode }),
      level,
      message,
    },
    ...(node && { sourceOffset: node.offset }),
  };
}
