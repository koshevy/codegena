import { createGraphSuggestionSnippet } from './create-graph-suggestion-snippet';

describe('createGraphSuggestionSnippet', () => {
  it('shows an exact-case excerpt before an earlier lowercase match', () => {
    const text = [
      'const user = "lowercase";',
      'const User = "matching case";',
    ].join('\n');

    expect(createGraphSuggestionSnippet(text, 'User')).toEqual({
      activeColumnNumber: 7,
      activeLineNumber: 2,
      lines: [
        { content: 'const user = "lowercase";', lineNumber: 1 },
        { content: 'const User = "matching case";', lineNumber: 2 },
      ],
    });
  });

  it('keeps formatted file lines and starts at the declaration', () => {
    const text = [
      'import type { TCode } from "./types";',
      '',
      'export type Response<',
      '  TCode extends 200 = 200,',
      '> = TCode;',
    ].join('\n');

    expect(createGraphSuggestionSnippet(text, 'TCode', 3)).toEqual({
      activeColumnNumber: 3,
      activeLineNumber: 4,
      lines: [
        { content: 'export type Response<', lineNumber: 3 },
        { content: '  TCode extends 200 = 200,', lineNumber: 4 },
        { content: '> = TCode;', lineNumber: 5 },
      ],
    });
  });
});
