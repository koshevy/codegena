import {
  type Logger as PinoLogger,
  type LogEvent as PinoLogEvent,
  pino,
} from 'pino';

export type LogEvent = PinoLogEvent;
export type Logger = PinoLogger;
export const logger = pino;
