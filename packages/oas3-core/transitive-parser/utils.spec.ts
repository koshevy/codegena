import colors from 'ansi-colors';
import { ParseErrorCode } from 'jsonc-parser';

import { JsonParseError } from './json-parse-error';
import { getNodeErrorText } from './utils';

const stripCodeFramePadding = (value: string): string => (
  colors.stripColor(value).replaceAll(/ +$/gm, '')
);

function withColorsEnabled(assertions: () => void): void {
  const previousColorsEnabled = colors.enabled;

  colors.enabled = true;

  try {
    assertions();
  }
  finally {
    colors.enabled = previousColorsEnabled;
  }
}

describe('getNodeErrorText', () => {
  it('should color the gutter and code over the full frame width', () => {
    const escape = String.fromCharCode(27);

    withColorsEnabled(() => {
      const result = getNodeErrorText(
        'first\nvalue\nthird',
        { offset: 6 },
        'schema.jsonc',
      );

      const resultLines = result.split('\n');
      const renderedCodeLines = [resultLines[2], resultLines[3], resultLines[5]];

      const renderedCodeWidths = renderedCodeLines.map((codeLine) => (
        colors.stripColor(codeLine ?? '').length
      ));

      expect(resultLines[1]).toBe(`${escape}[34mschema.jsonc:2:1${escape}[39m`);
      expect(resultLines[3]).toContain(
        `> ${escape}[33m2${escape}[39m ${escape}[33m|${escape}[39m`,
      );
      expect(resultLines[3]).toContain(`${escape}[95mvalue`);
      expect(resultLines[4]).toBe(`    ${escape}[33m|${escape}[39m ^`);

      const uniqueWidths = new Set(renderedCodeWidths);

      expect(uniqueWidths.size).toBe(1);
      expect(renderedCodeWidths[0]).toBeGreaterThanOrEqual(60);
      expect(renderedCodeLines.every((codeLine) => (
        codeLine?.endsWith(`${escape}[39m`)
      ))).toBe(true);
      expect(result).not.toContain(`${escape}[7m`);
    });
  });

  it('should color whitespace-only lines over the full frame width', () => {
    const escape = String.fromCharCode(27);

    withColorsEnabled(() => {
      const result = getNodeErrorText(
        'first\n   \nthird',
        { offset: 6 },
        'schema.jsonc',
      );

      const whitespaceOnlyLine = result.split('\n')[3] ?? '';

      expect(whitespaceOnlyLine).toContain(`${escape}[95m   `);
      expect(whitespaceOnlyLine.endsWith(
        `${escape}[39m`,
      )).toBe(true);
      expect(colors.stripColor(whitespaceOnlyLine).length).toBeGreaterThanOrEqual(60);
    });
  });

  it('should expand the colored code span to fit a long source line', () => {
    const content = ['short', 'x'.repeat(100), 'last'].join('\n');
    const result = getNodeErrorText(content, { offset: 6 });
    const resultLines = result.split('\n');
    const codeLines = [resultLines[2], resultLines[3], resultLines[5]];
    const codeWidths = codeLines.map((codeLine) => (
      colors.stripColor(codeLine ?? '').length
    ));

    const uniqueWidths = new Set(codeWidths);

    expect(uniqueWidths.size).toBe(1);
    expect(codeWidths[0]).toBeGreaterThanOrEqual(106);
  });

  it('should show numbered neighboring lines and a parseable source location', () => {
    const content = ['{', '  "name": "Ada",', '  "active": true', '}'].join('\n');
    const offset = content.indexOf('"active"');

    expect(stripCodeFramePadding(getNodeErrorText(
      content,
      { offset },
      '/schemas/profile.jsonc',
    ))).toBe(`Encountered at:
/schemas/profile.jsonc:3:3
  2 |   "name": "Ada",
> 3 |   "active": true
    |   ^
  4 | }`);
  });

  it('should omit unavailable neighbors and align the caret after a tab', () => {
    const content = '{\r\n\t"item": 1\r\n}';
    const offset = content.indexOf('"item"');

    expect(stripCodeFramePadding(getNodeErrorText(
      content,
      { offset },
      'inventory.jsonc',
    ))).toBe('Encountered at:\ninventory.jsonc:2:2\n  1 | {\n'
      + '> 2 | \t"item": 1\n    | \t^\n  3 | }');

    expect(stripCodeFramePadding(getNodeErrorText(
      'true',
      { offset: 0 },
      'single.jsonc',
    ))).toBe('Encountered at:\nsingle.jsonc:1:1\n> 1 | true\n    | ^');
  });

  it('should align the left gutter when line numbers gain a digit', () => {
    const content = Array.from({ length: 11 }, (_, index) => (
      `line ${index + 1}`
    )).join('\n');
    const offset = content.indexOf('line 10');

    expect(stripCodeFramePadding(getNodeErrorText(
      content,
      { offset },
      'long.jsonc',
    ))).toBe(`Encountered at:
long.jsonc:10:1
   9 | line 9
> 10 | line 10
     | ^
  11 | line 11`);
  });

  it('should point a syntax error to its parser offset without an AST node', () => {
    const content = '{\n  "name":,\n}';
    const offset = content.indexOf(',');
    const error = new JsonParseError('Invalid value', content, null, {
      jsoncParseErrors: [{
        error: ParseErrorCode.ValueExpected,
        length: 1,
        offset,
      }],
      logger: false,
      sourceFileId: 'invalid.jsonc',
    });

    const cause = new Error('Invalid JSON token');
    const errorWithOptions = new JsonParseError('Invalid value', {
      originalFileContent: content,
      jsoncParseErrors: [{
        error: ParseErrorCode.ValueExpected,
        length: 1,
        offset,
      }],
      logger: false,
      sourceFileId: 'invalid.jsonc',
      cause,
    });

    expect(errorWithOptions.message).toBe(error.message);
    expect(errorWithOptions.cause).toBe(cause);
    expect(stripCodeFramePadding(error.message)).toBe(
      'Error occurred at JSON parsing time with a message:\n'
      + 'Invalid value\n'
      + 'Encountered at:\n'
      + 'invalid.jsonc:2:10\n'
      + '  1 | {\n'
      + '> 2 |   "name":,\n'
      + '    |          ^\n'
      + '  3 | }',
    );
  });
});
