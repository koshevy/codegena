import { jsonSchemaToTypescript } from '@codegena/oas3-visitor-typescript';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createOutputPlans } from './create-output-plans';

const schemaFilePath = join(__dirname, '../__fixtures__/account.jsonc');

describe('createOutputPlans', () => {
  it('rejects an escaping file path before returning any plans', async () => {
    const groups = await jsonSchemaToTypescript({
      mode: 'singleFile',
      srcFilePath: schemaFilePath,
    });
    const group = groups[0];

    if (!group) {
      throw new Error('Expected a generated group.');
    }

    const escapedGroup = {
      ...group,
      sourceFile: {
        ...group.sourceFile,
        fileName: '../escape.ts',
      },
    };

    const outputDirectory = join(tmpdir(), 'codegena-output-plan');

    expect(() => createOutputPlans(
      [group, escapedGroup],
      outputDirectory,
    )).toThrow('Generated file path escapes the output directory');
  });
});
