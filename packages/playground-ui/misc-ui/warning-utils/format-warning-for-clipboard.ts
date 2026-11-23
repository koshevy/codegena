import type { GraphPayloadLog } from '@codegena/graph-core';

import { getWarningDetails } from './get-warning-details';

export function formatWarningForClipboard(
  log: GraphPayloadLog,
  sourceSchemaText: string,
): string {
  const { lineNumberWidth, message, sourceLines } = getWarningDetails(
    log,
    sourceSchemaText,
  );

  const location = log.jsoncNode;
  const level = log.level === 'error' ? 'Error' : 'Warning';

  const heading = location
    ? `${level} (${location.fileName}:${location.line}:${location.col}):`
    : `${level}:`;

  const codeLines = sourceLines.flatMap((line) => {
    const marker = line.isActive ? '>' : ' ';
    const lineNumber = String(line.lineNumber).padStart(lineNumberWidth);
    const renderedLine = `${marker} ${lineNumber} | ${line.content}`;

    if (!line.isActive) {
      return [renderedLine];
    }

    return [
      renderedLine,
      `  ${' '.repeat(lineNumberWidth)} | ${line.caretSpacing}^`,
    ];
  });

  return [heading, message, ...codeLines].filter(Boolean).join('\n');
}
