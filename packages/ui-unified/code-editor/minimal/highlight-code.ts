import {
  createHighlighter,
  type HighlightToken,
} from '@tanstack/highlight/core';
import { js } from '@tanstack/highlight/languages/js';
import { json } from '@tanstack/highlight/languages/json';
import { jsx } from '@tanstack/highlight/languages/jsx';
import { shell } from '@tanstack/highlight/languages/shell';
import { ts } from '@tanstack/highlight/languages/ts';
import { tsx } from '@tanstack/highlight/languages/tsx';

const highlighter = createHighlighter({ languages: [js, json, jsx, shell, ts, tsx] });

const primitiveTypes = new Set([
  'any', 'bigint', 'boolean', 'never', 'number', 'object', 'string', 'symbol',
  'undefined', 'unknown', 'void',
]);

export interface HighlightedToken {
  offset: number;
  style?: string;
  value: string;
}

export interface HighlightedLine {
  indentColumns: number;
  number: number;
  tokens: HighlightedToken[];
}

const bracketPairs = { '(': ')', '[': ']', '{': '}' } as const;
const bracketColors = [
  'keyword', 'type', 'number', 'string', 'regexp', 'comment',
] as const;

function isOpeningBracket(character: string): character is keyof typeof bracketPairs {
  return Object.hasOwn(bracketPairs, character);
}

function bracketStyle(character: string, closingBrackets: string[]): string {
  if (isOpeningBracket(character)) {
    const depth = closingBrackets.length;

    closingBrackets.push(bracketPairs[character]);

    return bracketColors[depth % bracketColors.length];
  }

  if (closingBrackets.at(-1) === character) {
    closingBrackets.pop();

    return bracketColors[closingBrackets.length % bracketColors.length];
  }

  return 'invalid';
}

function mapTokenStyle(token: HighlightToken, language: string): string | undefined {
  const { className, value } = token;

  if (className === 'literal' && value.startsWith('`')) {
    return 'string';
  }

  if (className === 'literal' && value.startsWith('/')) {
    return 'regexp';
  }

  const isPrimitiveType = className === 'type' && primitiveTypes.has(value);

  if (isPrimitiveType || className === 'literal') {
    return 'keyword';
  }

  const isTemplateDelimiter = className === 'operator' && ['${', '}'].includes(value);

  if (isTemplateDelimiter) {
    return undefined;
  }

  if (className === 'property' && language === 'json') {
    return 'type';
  }

  return className;
}

function mapTokensToLine(
  number: number,
  tokens: HighlightedToken[],
  source: string,
): HighlightedLine {
  const indent = source.match(/^[ \t]+/)?.[0] ?? '';
  const indentColumns = indent.replaceAll('\t', '    ').length;

  return { indentColumns, number, tokens };
}

export function highlightCode(source: string, language: string): HighlightedLine[] {
  const { lang, tokens } = highlighter.tokenize(source, { lang: language });
  const lines: HighlightedLine[] = [];
  const sourceLines = source.split('\n');
  const closingBrackets: string[] = [];
  const canColorBrackets = lang !== 'plaintext' && lang !== 'shell';
  let line: HighlightedToken[] = [];
  let offset = 0;

  for (const token of tokens) {
    const style = mapTokenStyle(token, lang);

    const canColorTokenBrackets = canColorBrackets && !style;
    const separator = canColorTokenBrackets ? /([()[\]{}\n])/ : /(\n)/;

    // Keep line breaks out of token spans so each row retains a fixed height.
    for (const value of token.value.split(separator)) {
      if (!value) {
        continue;
      }

      if (value === '\n') {
        lines.push(mapTokensToLine(lines.length + 1, line, sourceLines[lines.length]));
        line = [];
        offset += 1;
        continue;
      }

      const isBracket = canColorTokenBrackets && /^[()[\]{}]$/.test(value);
      const partStyle = isBracket ? bracketStyle(value, closingBrackets) : style;

      line.push({ offset, style: partStyle, value });
      offset += value.length;
    }
  }

  lines.push(mapTokensToLine(lines.length + 1, line, sourceLines[lines.length]));

  return lines;
}
