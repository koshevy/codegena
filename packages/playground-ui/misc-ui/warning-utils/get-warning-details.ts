import type { GraphPayloadLog } from '@codegena/graph-core';

import { getWarningMessage } from './get-warning-message';

export interface WarningSourceLine {
  caretSpacing: string;
  content: string;
  isActive: boolean;
  lineNumber: number;
}

export interface WarningDetails {
  lineNumberWidth: number;
  message: string;
  sourceLines: WarningSourceLine[];
}

export function getWarningDetails(
  log: GraphPayloadLog,
  sourceSchemaText: string,
): WarningDetails {
  const message = getWarningMessage(log);
  const location = log.jsoncNode;

  if (!location) {
    return { lineNumberWidth: 0, message, sourceLines: [] };
  }

  const lines = sourceSchemaText.split(/\r?\n/);

  if (location.line < 1 || location.line > lines.length) {
    return { lineNumberWidth: 0, message, sourceLines: [] };
  }

  const firstLine = Math.max(1, location.line - 1);
  const lastLine = Math.min(lines.length, location.line + 1);

  const sourceLines = lines.slice(firstLine - 1, lastLine).map(
    (content, index): WarningSourceLine => {
      const lineNumber = firstLine + index;
      const isActive = lineNumber === location.line;

      const caretSpacing = content
        .slice(0, location.col - 1)
        .replaceAll(/[^\t]/g, ' ');

      return { caretSpacing, content, isActive, lineNumber };
    },
  );

  return {
    lineNumberWidth: String(lastLine).length,
    message,
    sourceLines,
  };
}
