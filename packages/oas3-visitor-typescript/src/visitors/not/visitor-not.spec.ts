import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';

import { visitorNot } from './visitor-not';
import { resetIdentifiers } from '../../misc-utils';
import {
  getAnotherByTransitiveNodeArrayMock,
  resetArrayUltimateParser,
  setArrayUltimateParserLogger,
} from '../__mocks__/get-another-by-transitive-node-array.mock';
import { renderSchemaByFileName } from '../testing-utils';

describe('visitor-not', () => {
  let logger: Logger;

  async function renderNotSchemaByFileName(
    fixtureFilePath: string,
    isInline = false,
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      getAnotherByTransitiveNode: getAnotherByTransitiveNodeArrayMock,
      isInline,
      logger,
      mainVisitor: visitorNot,
    });
  }

  beforeEach(() => {
    logger = createTestingLogger([]);
    resetIdentifiers();
    resetArrayUltimateParser();
    setArrayUltimateParserLogger(logger);
  });

  it('should subtract negative literal values', async () => {
    expect(await renderNotSchemaByFileName('not-string-enum.json'))
      .toBe('export type NotStringEnum = "active";');
  });

  it('should remove negative variants from a variative union', async () => {
    expect(await renderNotSchemaByFileName('not-variative.json'))
      .toBe('export type NotVariative = string;');
  });

  it('should use Exclude for an inline named variative union', async () => {
    expect(await renderNotSchemaByFileName('not-variative.json', true))
      .toBe('Exclude<NotVariative, number>');
  });

  it('should subtract allOf negative constraints', async () => {
    expect(await renderNotSchemaByFileName('not-all-of.json'))
      .toBe('export type NotAllOf = "active";');
  });

  it('should apply every allOf negative constraint', async () => {
    expect(await renderNotSchemaByFileName('not-all-of-multiple.json'))
      .toBe('export type NotAllOfMultiple = "active";');
  });
});
