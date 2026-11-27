import type {
  DeclarationType,
  ProgrammingLanguageInfo,
} from '@codegena/oas3-core/ultimate-parser';

import type { GraphPayloadLog } from './graph-payload-log';
import type { GraphPayloadSourceLocation } from './graph-payload-source-location';

export interface GraphPayloadItemNodeData<TAstObject extends object = object> extends
  ProgrammingLanguageInfo,
  Record<string, unknown> {
  ast: TAstObject;
  /**
   * Zero-based column in the generated file when the snippet is found.
   */
  col?: number;
  declarationType: DeclarationType;
  hideUnconnectedHandles?: boolean;
  identifierName?: string;
  kind: 'item';
  label: string;
  /**
   * One-based line in the generated file when the snippet is found.
   */
  line?: number;
  logs: GraphPayloadLog[];
  relativeFilePath: string;
  sourceLocation: GraphPayloadSourceLocation;
  text: string;
}
