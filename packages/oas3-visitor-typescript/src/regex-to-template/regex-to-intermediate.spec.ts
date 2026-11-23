import {
  regexToIntermediateResult,
  stringTypeTemplateSymbol,
} from './regex-to-intermediate';

describe('regexToTemplate', () => {
  describe('Ending and starting assertions', () => {
    it('should parse literal text', () => {
      const result = regexToIntermediateResult(
        /^literalText$/,
      );

      expect(result).toEqual(['literalText']);
    });

    it('should parse literal text and non-parseable value', () => {
      const result = regexToIntermediateResult(
        /^literalText.*$/,
      );

      expect(result).toEqual([
        'literalText',
        stringTypeTemplateSymbol,
      ]);
    });

    it('should parse required union without parentheses', () => {
      const result = regexToIntermediateResult(
        /^abc|def|ghi$/,
      );

      expect(result).toEqual([
        stringTypeTemplateSymbol,
        ['abc', 'def', 'ghi'],
        stringTypeTemplateSymbol,
      ]);
    });

    it('should required union with parentheses', () => {
      const result = regexToIntermediateResult(
        /^(abc|def|ghi)$/,
      );

      expect(result).toEqual([
        ['abc', 'def', 'ghi'],
      ]);
    });

    it('should parse non-required union with parentheses', () => {
      const result = regexToIntermediateResult(
        /^(abc|def|ghi)?$/,
      );

      expect(result).toEqual([
        ['abc', 'def', 'ghi', ''],
      ]);
    });

    it('should parse symbol consequence with optional parts', () => {
      const result = regexToIntermediateResult(
        /^ab?cdef??$/,
      );

      expect(result).toEqual(['a', ['b', ''], 'cde', ['f', '']]);
    });

    it('should parse optional literal text', () => {
      const result = regexToIntermediateResult(
        /^(optionalPart)?$/,
      );

      expect(result).toEqual([['optionalPart', '']]);
    });

    it('should parse optional literal text and unparseable part', () => {
      const result = regexToIntermediateResult(
        /^(optionalPart)?[^a-zA-Z]+.*$/,
      );

      expect(result).toEqual([
        ['optionalPart', ''],
        stringTypeTemplateSymbol,
      ]);
    });

    it('should parse complex regex', () => {
      const result = regexToIntermediateResult(
        /^startingText[^a-z](abc|(def|ghi)?).*[0-9](jkl|mno)?(.*)(pqr|sto)(endingText)?$/,
      );

      expect(result).toMatchObject([
        'startingText',
        stringTypeTemplateSymbol,
        ['abc', 'def', 'ghi', ''],
        stringTypeTemplateSymbol,
        ['jkl', 'mno', ''],
        stringTypeTemplateSymbol,
        ['pqr', 'sto'],
        ['endingText', ''],
      ]);
    });
  });

  it('should parse complex regex without starting assertion', () => {
    const result = regexToIntermediateResult(
      /notStrictStartingText[^a-z](abc|def|ghi)?endingText$/,
    );

    expect(result).toMatchObject([
      stringTypeTemplateSymbol,
      'notStrictStartingText',
      stringTypeTemplateSymbol,
      ['abc', 'def', 'ghi', ''],
      'endingText',
    ]);
  });

  it('should parse complex regex without starting assertion', () => {
    const result = regexToIntermediateResult(
      /notStrictStartingText[^a-z](notStrictEndingText)$/,
    );

    expect(result).toMatchObject([
      stringTypeTemplateSymbol,
      'notStrictStartingText',
      stringTypeTemplateSymbol,
      'notStrictEndingText',
    ]);
  });

  it('should fall back to string when the maximum depth is reached', () => {
    const result = regexToIntermediateResult(/^((nested))$/, 1);

    expect(result).toEqual([stringTypeTemplateSymbol]);
  });
});
