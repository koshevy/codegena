import type { Node } from 'jsonc-parser';

/**
 * A source location resolved from a logged JSONC node.
 */
export interface CollectedLogLocation {
  col: number;
  fileName: string;
  line: number;
}

/**
 * A structured parser or visitor message, including its original source node.
 */
export interface CollectedLog {
  error?: Error;
  jsoncNode?: CollectedLogLocation;
  level: string;
  message: string;
  node?: Node;
}

export interface CollectedLogSourceContext {
  sourceFileId?: string;
  sourceText?: string;
}
