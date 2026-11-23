import type { Node } from 'jsonc-parser';
import type { LogFn } from 'pino';

export interface RawLog {
  error?: Error;
  level: number;
  message: string;
  node?: Node;
  sourceFileId?: string;
}

function isJsoncNode(value: unknown): value is Node {
  return typeof value === 'object'
    && value !== null
    && 'offset' in value
    && typeof value.offset === 'number'
    && 'length' in value
    && typeof value.length === 'number';
}

function getRecordData(value: unknown): Pick<RawLog, 'error' | 'node' | 'sourceFileId'> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  return {
    ...('error' in value && value.error instanceof Error && {
      error: value.error,
    }),
    ...('node' in value && isJsoncNode(value.node) && {
      node: value.node,
    }),
    ...('sourceFileId' in value && typeof value.sourceFileId === 'string' && {
      sourceFileId: value.sourceFileId,
    }),
  };
}

export function mapPinoArgumentsToRawLog(
  args: Parameters<LogFn>,
  level: number,
): RawLog {
  const [first, second] = args;
  const hasData = typeof first === 'object' && first !== null;

  return {
    ...getRecordData(hasData ? first : undefined),
    level,
    message: String(hasData ? (second ?? '') : first),
  };
}

export function mapPinoRecordToRawLog(record: unknown): RawLog | null {
  if (typeof record !== 'object' || record === null) {
    return null;
  }

  const level = 'level' in record && typeof record.level === 'number'
    ? record.level
    : 30;
  const message = 'msg' in record ? record.msg : '';

  return {
    ...getRecordData(record),
    level,
    message: String(message),
  };
}
