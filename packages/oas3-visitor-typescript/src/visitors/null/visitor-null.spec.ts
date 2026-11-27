import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';

import { resetIdentifiers } from '../../misc-utils';
import {
  resetUltimateParser,
  setUltimateParserLogger,
} from '../__mocks__';
import { renderSchemaByFileName } from '../testing-utils';
import { visitorNull } from './visitor-null';

describe('visitor-null', () => {
  let logger: Logger;

  async function renderNullSchemaByFileName(
    fixtureFilePath: string,
    isInline = false,
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      isInline,
      logger,
      mainVisitor: visitorNull,
    });
  }

  beforeEach(() => {
    logger = createTestingLogger([]);
    resetIdentifiers();
    resetUltimateParser();
    setUltimateParserLogger(logger);
  });

  it('should create a null type alias', async () => {
    expect(await renderNullSchemaByFileName('null-deleted-at.jsonc')).toBe(
      'type NullDeletedAt = null;',
    );
  });

  it('should create an inline null type', async () => {
    expect(await renderNullSchemaByFileName(
      'null-deleted-at.jsonc',
      true,
    )).toBe('null');
  });

  it('should ignore nodes that are not null scalars', async () => {
    expect(await renderNullSchemaByFileName(
      'string-plain.jsonc',
    )).toBeUndefined();
  });
});
