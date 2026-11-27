import colors from 'ansi-colors';

const levelLabels = new Map([
  [10, 'TRACE'],
  [20, 'DEBUG'],
  [30, 'INFO'],
  [40, 'WARN'],
  [50, 'ERROR'],
  [60, 'FATAL'],
]);

const levelColors = new Map<number, (value: string) => string>([
  [10, colors.gray],
  [20, colors.gray],
  [30, colors.cyan],
  [40, colors.yellow],
  [50, colors.red],
  [60, colors.redBright],
]);

export interface FormatLogRecordOptions {
  colorize?: boolean;
}

export function formatLogRecord(
  record: unknown,
  { colorize = false }: FormatLogRecordOptions = {},
): string {
  if (typeof record !== 'object' || record === null || !('msg' in record)) {
    return String(record);
  }

  const message = String(record.msg);

  if (!('level' in record) || typeof record.level !== 'number') {
    return message;
  }

  const level = levelLabels.get(record.level) ?? 'LOG';
  const renderedLevel = colorize
    ? (levelColors.get(record.level) ?? colors.white)(level)
    : level;

  return `${renderedLevel}: ${message}`;
}
