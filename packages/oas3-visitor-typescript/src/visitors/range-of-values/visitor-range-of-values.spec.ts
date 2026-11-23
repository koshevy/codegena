import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';

import { resetIdentifiers } from '../../misc-utils';
import {
  resetUltimateParser,
  setUltimateParserLogger,
} from '../__mocks__';
import { renderSchemaByFileName } from '../testing-utils';
import { visitorRangeOfValues } from './visitor-range-of-values';

describe('visitor-range-of-values', () => {
  let logger: Logger;

  async function renderRangeOfValuesSchemaByFileName(
    fixtureFilePath: string,
    isInline = false,
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      isInline,
      logger,
      mainVisitor: visitorRangeOfValues,
    });
  }

  beforeEach(() => {
    logger = createTestingLogger([]);
    resetIdentifiers();
    resetUltimateParser();
    setUltimateParserLogger(logger);
  });

  it('should create a literal type alias for one range value', async () => {
    expect(await renderRangeOfValuesSchemaByFileName(
      'range-values-single.jsonc',
    )).toBe('type RangeValuesSingle = "archived";');
  });

  it('should create a literal union for several range values', async () => {
    expect(await renderRangeOfValuesSchemaByFileName(
      'range-values-status.jsonc',
    )).toBe('type RangeValuesStatus = "draft" | "published";');
  });

  it('should create literals for an otherwise unknown schema', async () => {
    expect(await renderRangeOfValuesSchemaByFileName(
      'range-values-unknown.jsonc',
      true,
    )).toBe('false | null | -1');
  });

  it('should create a literal type for an object const value', async () => {
    expect(await renderRangeOfValuesSchemaByFileName(
      'range-values-object-single.jsonc',
    )).toBe(`type RangeValuesObjectSingle = {
    kind: "manual";
    priority: 1;
};`);
  });

  it('should create a literal union for distinct object enum values', async () => {
    expect(await renderRangeOfValuesSchemaByFileName(
      'range-values-objects.jsonc',
    )).toBe(`type RangeValuesObjects = {
    kind: "email";
    enabled: true;
} | {
    kind: "phone";
    enabled: false;
};`);
  });

  it('should create a literal union for array enum values', async () => {
    expect(await renderRangeOfValuesSchemaByFileName(
      'range-values-arrays.jsonc',
    )).toBe(`type RangeValuesArrays = [
    "email",
    2
] | [
    false,
    null
];`);
  });

  it('should ignore nodes without a range of values', async () => {
    expect(await renderRangeOfValuesSchemaByFileName(
      'string-plain.jsonc',
    )).toBeUndefined();
  });
});
