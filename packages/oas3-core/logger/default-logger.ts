import { formatLogRecord } from './format-log-record';
import { logger, type Logger } from './logger';

function writeFormattedRecord(record: unknown): void {
  const formattedLine = formatLogRecord(record, {
    colorize: typeof process !== 'undefined',
  });

  if (typeof process !== 'undefined') {
    process.stdout.write(`${formattedLine}\n`);
    return;
  }

  const browserConsole = globalThis.console;

  if (typeof record === 'object'
    && record !== null
    && 'level' in record
    && typeof record.level === 'number'
  ) {
    if (record.level >= 50) {
      browserConsole.error(formattedLine);
      return;
    }

    if (record.level >= 40) {
      browserConsole.warn(formattedLine);
      return;
    }
  }

  browserConsole.log(formattedLine);
}

export const defaultLogger: Logger = logger({
  browser: { write: writeFormattedRecord },
  level: 'trace',
}, {
  write: (line: string) => {
    writeFormattedRecord(JSON.parse(line));
  },
});
