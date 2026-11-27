import colors from 'ansi-colors';
import type { Node } from 'jsonc-parser';

function createLineStartsLookup(): (content: string) => number[] {
  let indexedSource: {
    content: string;
    lineStarts: number[];
  } | null = null;

  return (content) => {
    if (indexedSource?.content === content) {
      return indexedSource.lineStarts;
    }

    const lineStarts = [0];
    let newlineOffset = content.indexOf('\n');

    while (newlineOffset >= 0) {
      lineStarts.push(newlineOffset + 1);
      newlineOffset = content.indexOf('\n', newlineOffset + 1);
    }

    indexedSource = { content, lineStarts };

    return lineStarts;
  };
}

const getLineStarts = createLineStartsLookup();

function getLineNumber(lineStarts: number[], offset: number): number {
  let first = 0;
  let last = lineStarts.length;

  while (first < last) {
    const middle = Math.floor((first + last) / 2);

    if (lineStarts[middle] <= offset) {
      first = middle + 1;
    }
    else {
      last = middle;
    }
  }

  return first;
}

function getSourceLine(
  content: string,
  lineStarts: number[],
  lineNumber: number,
): string {
  const start = lineStarts[lineNumber - 1];
  const end = lineNumber < lineStarts.length
    ? lineStarts[lineNumber] - 1
    : content.length;
  const line = content.slice(start, end);

  return line.endsWith('\r') ? line.slice(0, -1) : line;
}

export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 0;
}

export function getLineAndColByContent(
  originalFileContent: string,
  offset: number,
): {
  col: number;
  line: number;
} {
  const lineStarts = getLineStarts(originalFileContent);
  const line = getLineNumber(lineStarts, offset);

  return {
    col: offset - lineStarts[line - 1] + 1,
    line,
  };
}

export function getNodeErrorText(
  originalFileContent: string,
  node: Pick<Node, 'offset'>,
  sourceFileId?: string,
): string {
  const { col, line } = getLineAndColByContent(
    originalFileContent,
    node.offset,
  );
  const lineStarts = getLineStarts(originalFileContent);
  const firstLine = Math.max(1, line - 1);
  const lastLine = Math.min(lineStarts.length, line + 1);
  const lineNumberWidth = String(lastLine).length;
  const sourceLines = Array.from(
    { length: lastLine - firstLine + 1 },
    (_, index) => getSourceLine(
      originalFileContent,
      lineStarts,
      firstLine + index,
    ),
  );

  const terminalWidth = Math.max(
    60,
    typeof process === 'undefined'
      ? 0
      : (process.stderr?.columns ?? process.stdout?.columns ?? 0),
  );

  const codeWidth = Math.max(
    terminalWidth - lineNumberWidth - 5,
    ...sourceLines.map((content) => content.length),
  );
  const codeLines: string[] = [];

  for (let lineNumber = firstLine; lineNumber <= lastLine; lineNumber += 1) {
    const content = sourceLines[lineNumber - firstLine] ?? '';
    const marker = lineNumber === line ? '>' : ' ';
    const lineLabel = String(lineNumber).padStart(lineNumberWidth);
    const renderedContent = colors.magentaBright(content.padEnd(codeWidth));

    codeLines.push(
      `${marker} ${colors.yellow(lineLabel)} ${colors.yellow('|')} ${renderedContent}`,
    );

    if (lineNumber === line) {
      const precedingContent = content.slice(0, col - 1);
      const caretSpacing = precedingContent.replaceAll(/[^\t]/g, ' ');
      const caret = `${caretSpacing}^`;

      codeLines.push(`  ${' '.repeat(lineNumberWidth)} ${colors.yellow('|')} ${caret}`);
    }
  }

  const location = `${sourceFileId ?? '<unknown>'}:${line}:${col}`;

  return [
    'Encountered at:',
    colors.blue(location),
    ...codeLines,
  ].join('\n');
}
