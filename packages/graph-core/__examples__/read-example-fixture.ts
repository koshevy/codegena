import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export function readExampleFixture(fixtureName: string): Promise<string> {
  const fixturePath = resolve(
    process.cwd(),
    'packages/oas3-visitor-typescript/src/__fixtures__',
    fixtureName,
  );

  return readFile(fixturePath, 'utf8');
}
