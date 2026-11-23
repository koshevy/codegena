import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';
import colors from 'ansi-colors';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { jsonSchemaToTypescript } from './json-schema-to-typescript';

async function renderRequestSchema(
  fileName: string,
  rootSchemaTypeName?: string,
  logger?: Logger,
): Promise<string> {
  const groups = await jsonSchemaToTypescript({
    logger,
    mode: 'singleFile',
    rootSchemaTypeName,
    srcFilePath: join(
      __dirname,
      '__fixtures__',
      fileName,
    ),
  });

  const renderedItems = await Promise.all(groups.map(({ toString }) => (
    toString()
  )));

  return renderedItems.join('\n\n');
}

function readRenderedExpectation(fileName: string): string {
  const absFilePath = join(
    __dirname,
    '__fixtures__/full-result-expectations',
    fileName,
  );

  return readFileSync(absFilePath, 'utf8');
}

describe('json-schema-to-typescript', () => {
  const accountSchemaJson = JSON.stringify({
    $defs: { User: { type: 'string' } },
    properties: { user: { $ref: '#/$defs/User' } },
  });

  it('should render json-schema-from-internet-jsonrpc-request-2.0.jsonc', async () => {
    const renderedResult = await renderRequestSchema(
      'json-schema-from-internet-jsonrpc-request-2.0.jsonc',
    );

    expect(renderedResult).toBe(
      readRenderedExpectation('json-schema-from-internet-jsonrpc-request-2.0.txt'),
    );
  });

  it('should correctly render json-schema-from-internet-geometry.jsonc', async () => {
    const renderedResult = await renderRequestSchema(
      'json-schema-from-internet-geometry.jsonc',
    );

    expect(renderedResult).toBe(
      readRenderedExpectation('json-schema-from-internet-geometry.txt'),
    );
  });

  it('should correctly render json-schema-from-internet-avro-schema.jsonc', async () => {
    const renderedResult = await renderRequestSchema(
      'json-schema-from-internet-avro-schema.jsonc',
    );

    expect(renderedResult).toBe(
      readRenderedExpectation('json-schema-from-internet-avro-schema.txt'),
    );
  });

  it('should correctly render comprehensive.jsonc', async () => {
    const logsCollection: string[] = [];

    const renderedResult = await renderRequestSchema(
      'comprehensive.jsonc',
      undefined,
      createTestingLogger(logsCollection),
    );

    expect(renderedResult).toBe(
      readRenderedExpectation('comprehensive.txt'),
    );

    const warningText = colors.stripColor(logsCollection.join('\n'))
      .replaceAll(/ +$/gm, '');

    const warnedSchemaPath = [
      '$defs',
      'SimplestObjectCases',
      'AnotherSimpleObjectWithProperties',
      'properties',
      'content',
    ].join('.');

    expect(warningText).toContain([
      `Unable to correctly parse object at ${warnedSchemaPath}`,
      'Used Record<string, unknown> as a fallback.',
      'Encountered at:',
      `${join(__dirname, '__fixtures__/comprehensive.jsonc')}:934:22`,
      '  933 |           },',
      '> 934 |           "content": {',
    ].join('\n'));
  });

  it('should render all declarations in one source file', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: accountSchemaJson,
      mode: 'singleFile',
      srcFileId: 'account.json',
    });

    const renderedGroups = await Promise.all(
      groups.map(({ toString }) => toString()),
    );
    const renderedResult = renderedGroups.join('\n\n');

    expect(groups.map(({ sourceFile }) => sourceFile.fileName))
      .toEqual(['types.ts']);
    expect(renderedResult).toBe(`export interface Account {
  user?: User;
}

export type User = string;`);
  });

  it('should convert a source path through a supplied file adapter', async () => {
    const readFile = jest.fn(() => accountSchemaJson);
    const groups = await jsonSchemaToTypescript({
      fileReadingAdapter: { readFile },
      mode: 'singleFile',
      srcFilePath: 'virtual/account.json',
    });

    expect(readFile).toHaveBeenCalledWith('virtual/account.json');
    expect(await groups[0]?.toString()).toContain('export interface Account');
  });

  it('documents properties without repeating comments on the interface', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        type: 'object',
        properties: {
          square: {
            type: 'boolean',
            description: 'Rounded corners are disabled when true.',
            $comment: 'Property note.',
          },
        },
      }),
      mode: 'singleFile',
      srcFileId: 'annotated.json',
    });

    const rendered = await groups[0]?.toString();

    expect(rendered).toBe(`export interface Annotated {
  /**
   * Rounded corners are disabled when true.
   *
   * @privateRemarks
   * Property note.
   */
  square?: boolean;
}`);
  });

  it('should render declarations in separate source files with imports', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: accountSchemaJson,
      mode: 'separateFiles',
      srcFileId: 'account.json',
    });

    const renderedGroups = await Promise.all(
      groups.map(({ toString }) => toString()),
    );
    const renderedResult = renderedGroups.join('\n\n');

    expect(groups.map(({ sourceFile }) => sourceFile.fileName)).toEqual([
      'account.ts',
      'user.ts',
    ]);
    expect(renderedResult).toBe(`import type { User } from './user';

export interface Account {
  user?: User;
}

export type User = string;`);
  });
});
