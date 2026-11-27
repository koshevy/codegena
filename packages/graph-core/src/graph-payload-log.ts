import type { GraphPayloadSourceLocation } from './graph-payload-source-location';

export interface GraphPayloadLogError {
  message: string;
  name: string;
  stack?: string;
}

export interface GraphPayloadLog {
  error?: GraphPayloadLogError;
  jsoncNode?: GraphPayloadSourceLocation;
  level: string;
  message: string;
}
