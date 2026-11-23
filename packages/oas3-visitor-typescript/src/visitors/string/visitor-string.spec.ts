import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';
import colors from 'ansi-colors';

import { resetIdentifiers } from '../../misc-utils';
import {
  resetUltimateParser,
  setUltimateParserLogger,
} from '../__mocks__';
import { renderSchemaByFileName } from '../testing-utils';
import { visitorString } from './visitor-string';

describe('visitor-string', () => {
  let logger: Logger;
  let logsCollection: string[];

  async function renderStringSchemaByFileName(
    fixtureFilePath: string,
    isInline = false,
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      isInline,
      logger,
      mainVisitor: visitorString,
    });
  }

  beforeEach(() => {
    logsCollection = [];
    logger = createTestingLogger(logsCollection);
    resetIdentifiers();
    resetUltimateParser();
    setUltimateParserLogger(logger);
  });

  it('should create a string type alias without a value pattern', async () => {
    expect(await renderStringSchemaByFileName('string-plain.jsonc')).toBe(
      'type StringPlain = string;',
    );
  });

  it('should create an inline template literal type from a value pattern', async () => {
    expect(await renderStringSchemaByFileName(
      'string-order-code.jsonc',
      true,
      // eslint-disable-next-line no-template-curly-in-string
    )).toBe('`ORDER_${string}`');
  });

  it('should create a template literal type from a built-in format', async () => {
    expect(await renderStringSchemaByFileName('string-email.jsonc')).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type StringEmail = `${string}@${string}`;',
    );
  });

  it('should create a Blob type from an OpenAPI binary format', async () => {
    expect(await renderStringSchemaByFileName('string-binary.jsonc')).toBe(
      'type StringBinary = Blob;',
    );
  });

  it('should create a template literal type from a date format', async () => {
    expect(await renderStringSchemaByFileName('string-date.jsonc')).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type StringDate = `${number}-${number}-${number}`;',
    );
  });

  it('should create a template literal type from a date-time format', async () => {
    expect(await renderStringSchemaByFileName('string-date-time.jsonc')).toBe(
      // eslint-disable-next-line max-len -- Exact raw TypeScript printer output.
      `type StringDateTime = \`\${number}-\${number}-\${number}T\${number}:\${number}:\${number}\${string}\`;`,
    );
  });

  it('should create a template literal type from a UUID format', async () => {
    expect(await renderStringSchemaByFileName('string-uuid.jsonc')).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type StringUuid = `${string}-${string}-${string}-${string}-${string}`;',
    );
  });

  it.each([
    'minLength',
    'maxLength',
  ])('should log ignored %s string schema property', async (propertyName) => {
    expect(await renderStringSchemaByFileName('string-customer-id.jsonc')).toBe(
      'type StringCustomerId = string;',
    );

    const logText = logsCollection.join('\n');
    const logTextWithoutCodePadding = colors.stripColor(logText)
      .replaceAll(/ +$/gm, '');

    expect(logText).toMatch(
      new RegExp(`Property "${propertyName}".*was ignored`, 's'),
    );
    expect(logTextWithoutCodePadding).toContain(
      'string-customer-id.jsonc:1:1\n> 1 | {\n    | ^',
    );
  });

  it('should ignore nodes that are not string scalars', async () => {
    expect(await renderStringSchemaByFileName(
      'object-properties-empty.jsonc',
    )).toBeUndefined();
  });
});
