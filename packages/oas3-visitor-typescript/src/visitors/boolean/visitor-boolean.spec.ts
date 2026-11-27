import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';

import { resetIdentifiers } from '../../misc-utils';
import {
  resetUltimateParser,
  setUltimateParserLogger,
} from '../__mocks__';
import { renderSchemaByFileName } from '../testing-utils';
import { visitorBoolean } from './visitor-boolean';

describe('visitor-boolean', () => {
  let logger: Logger;

  async function renderBooleanSchemaByFileName(
    fixtureFilePath: string,
    isInline = false,
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      isInline,
      logger,
      mainVisitor: visitorBoolean,
    });
  }

  beforeEach(() => {
    logger = createTestingLogger([]);
    resetIdentifiers();
    resetUltimateParser();
    setUltimateParserLogger(logger);
  });

  it('should create a boolean type alias', async () => {
    expect(await renderBooleanSchemaByFileName('boolean-is-active.jsonc')).toBe(
      'type BooleanIsActive = boolean;',
    );
  });

  it('should create an inline boolean type', async () => {
    expect(await renderBooleanSchemaByFileName(
      'boolean-is-active.jsonc',
      true,
    )).toBe('boolean');
  });

  it('should ignore nodes that are not boolean scalars', async () => {
    expect(await renderBooleanSchemaByFileName(
      'string-plain.jsonc',
    )).toBeUndefined();
  });
});
