import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { convertSchema } from './convert-schema';

const schemaFilePath = join(__dirname, '__fixtures__', 'account.jsonc');
const temporaryDirectories: string[] = [];

async function createOutputDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'codegena-cli-'));

  temporaryDirectories.push(directory);

  return directory;
}

describe('convertSchema', () => {
  afterAll(async () => {
    await Promise.all(temporaryDirectories.map((directory) => (
      rm(directory, { recursive: true, force: true })
    )));
  });

  it('should write related types to one file', async () => {
    const outputDirectory = await createOutputDirectory();
    const outputPaths = await convertSchema(
      schemaFilePath,
      outputDirectory,
      'singleFile',
    );

    expect(outputPaths).toEqual([join(outputDirectory, 'types.ts')]);
    expect(await readdir(outputDirectory)).toEqual(['types.ts']);
    expect(await readFile(join(outputDirectory, 'types.ts'), 'utf8')).toBe(`/**
 * ## Account
 */
export interface Account {
  user?: User;
}

export interface User {
  id: string;
}
`);
  });

  it('should write separate files with a relative import', async () => {
    const outputDirectory = await createOutputDirectory();
    const outputPaths = await convertSchema(
      schemaFilePath,
      outputDirectory,
      'separateFiles',
    );

    const accountContent = await readFile(join(outputDirectory, 'account.ts'), 'utf8');
    const userContent = await readFile(join(outputDirectory, 'user.ts'), 'utf8');

    expect(outputPaths).toEqual([
      join(outputDirectory, 'account.ts'),
      join(outputDirectory, 'user.ts'),
    ]);
    expect(await readdir(outputDirectory)).toEqual(['account.ts', 'user.ts']);
    expect(accountContent).toBe(`import type { User } from './user';

/**
 * ## Account
 */
export interface Account {
  user?: User;
}
`);
    expect(userContent).toBe(`export interface User {
  id: string;
}
`);
  });
});
