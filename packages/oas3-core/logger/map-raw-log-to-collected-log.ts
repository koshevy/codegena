import type {
  CollectedLog,
  CollectedLogSourceContext,
} from './collected-log';
import type { RawLog } from './raw-log';

const levelNames = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
} as const;

export function mapRawLogToCollectedLog(
  { error, level, message, node, sourceFileId }: RawLog,
  context: CollectedLogSourceContext,
): CollectedLog {
  const fileName = sourceFileId ?? context.sourceFileId;
  const hasMatchingSource = !sourceFileId
    || sourceFileId === context.sourceFileId;
  const linesBeforeNode = node && hasMatchingSource && context.sourceText
    ? context.sourceText.slice(0, node.offset).split('\n')
    : null;

  return {
    ...(error && { error }),
    ...(node && { node }),
    ...(fileName && linesBeforeNode && {
      jsoncNode: {
        col: (linesBeforeNode.at(-1)?.length ?? 0) + 1,
        fileName,
        line: linesBeforeNode.length,
      },
    }),
    level: levelNames[level as keyof typeof levelNames] ?? 'info',
    message,
  };
}
