import type {
  CollectedLog,
  CollectedLogSourceContext,
} from './collected-log';
import { formatLogRecord } from './format-log-record';
import { logger, type Logger } from './logger';
import { mapRawLogToCollectedLog } from './map-raw-log-to-collected-log';
import {
  mapPinoArgumentsToRawLog,
  mapPinoRecordToRawLog,
  type RawLog,
} from './raw-log';

export interface CollectingLoggerOptions extends CollectedLogSourceContext {
  colorize?: boolean;
  output?: (formattedLine: string) => void;
}

/**
 * Captures structured Pino calls without serializing JSONC parent links.
 */
export class CollectingLogger {
  readonly logger: Logger;
  private readonly rawLogs: RawLog[] = [];

  constructor(private readonly options: CollectingLoggerOptions = {}) {
    const { rawLogs } = this;

    this.logger = logger({
      browser: {
        write: (record: unknown) => {
          const rawLog = mapPinoRecordToRawLog(record);

          if (!rawLog) {
            return;
          }

          this.rawLogs.push(rawLog);
          this.options.output?.(formatLogRecord(record, {
            colorize: this.options.colorize,
          }));
        },
      },
      hooks: {
        logMethod(args, method, level) {
          rawLogs.push(mapPinoArgumentsToRawLog(args, level));
          method.apply(this, args);
        },
      },
      level: 'trace',
    }, {
      write: (line: string) => {
        const record: unknown = JSON.parse(line);
        const completedLog = mapPinoRecordToRawLog(record);
        const pendingLog = this.rawLogs.at(-1);

        if (completedLog && pendingLog) {
          pendingLog.message = completedLog.message;
        }

        if (this.options.output) {
          this.options.output(formatLogRecord(record, {
            colorize: this.options.colorize,
          }));
        }
      },
    });
  }

  getLogs(): CollectedLog[] {
    return this.rawLogs.map((rawLog) => (
      mapRawLogToCollectedLog(rawLog, this.options)
    ));
  }
}
