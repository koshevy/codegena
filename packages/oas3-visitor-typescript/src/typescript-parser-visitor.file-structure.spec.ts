import { createTestingLogger } from '@codegena/oas3-core/logger';
import { join } from 'node:path';

import { jsonSchemaToTypescript } from './json-schema-to-typescript';

const onePasswordFixturePath = join(
  __dirname,
  '../../oas3-core/transitive-parser/__fixtures__/oas3-onepassword-connect.json',
);

const githubFixturePath = join(
  __dirname,
  '__fixtures__/oas3-api-github-com.json',
);

describe('TypeScript separate-file output smoke', () => {
  it('renders every 1Password output file', async () => {
    const groups = await jsonSchemaToTypescript({
      logger: createTestingLogger([]),
      mode: 'separateFiles',
      srcFilePath: onePasswordFixturePath,
    });

    const files = await Promise.all(groups.map(async (group) => ({
      fileName: group.fileName,
      source: await group.toString(),
    })));

    const sortedFiles = files.toSorted((first, second) => (
      first.fileName.localeCompare(second.fileName)
    ));

    expect(sortedFiles).toMatchSnapshot();
  }, 30000);

  it('preserves GitHub generated file structure', async () => {
    const groups = await jsonSchemaToTypescript({
      logger: createTestingLogger([]),
      mode: 'separateFiles',
      srcFilePath: githubFixturePath,
    });

    const fileStructure = groups
      .map(({ fileName }) => fileName)
      .toSorted()
      .join('\n');

    expect(fileStructure).toMatchSnapshot();
  }, 30000);
});
