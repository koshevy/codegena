import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';

import { resetIdentifiers } from '../../misc-utils';
import {
  resetUltimateParser,
  setUltimateParserLogger,
} from '../__mocks__';
import { renderSchemaByFileName } from '../testing-utils';
import { visitorNumber } from './visitor-number';

describe('visitor-number', () => {
  let logger: Logger;
  let logsCollection: string[];

  async function renderNumberSchemaByFileName(
    fixtureFilePath: string,
    isInline = false,
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      isInline,
      logger,
      mainVisitor: visitorNumber,
    });
  }

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
    resetIdentifiers();
    resetUltimateParser();
    setUltimateParserLogger(logger);
  });

  it('should create a number type alias for a floating-point schema', async () => {
    expect(await renderNumberSchemaByFileName('number-price.jsonc')).toBe(
      'type NumberPrice = number;',
    );
  });

  it('should create a number type alias for an integer schema', async () => {
    expect(await renderNumberSchemaByFileName('integer-stock.jsonc')).toBe(
      'type IntegerStock = number;',
    );
  });

  it.each([
    'minimum',
    'maximum',
    'multipleOf',
  ])('should log ignored %s number schema property', async (propertyName) => {
    expect(await renderNumberSchemaByFileName('number-price.jsonc')).toBe(
      'type NumberPrice = number;',
    );
    expect(logsCollection.join('\n')).toMatch(
      new RegExp(`Property "${propertyName}".*was ignored`, 's'),
    );
  });

  it.each([
    'exclusiveMinimum',
    'exclusiveMaximum',
  ])('should log ignored %s integer schema property', async (propertyName) => {
    expect(await renderNumberSchemaByFileName('integer-stock.jsonc')).toBe(
      'type IntegerStock = number;',
    );
    expect(logsCollection.join('\n')).toMatch(
      new RegExp(`Property "${propertyName}".*was ignored`, 's'),
    );
  });

  it('should ignore nodes that are not numeric scalars', async () => {
    expect(await renderNumberSchemaByFileName(
      'string-plain.jsonc',
    )).toBeUndefined();
  });
});
