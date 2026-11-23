import { jsonSchemaToTypescript } from '@codegena/oas3-visitor-typescript';
import colors from 'ansi-colors';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { createGreeting } from './create-greeting';

const execFileAsync = promisify(execFile);
const schemaFilePath = join(__dirname, '../src/__fixtures__/comprehensive.jsonc');
const githubSchemaFilePath = join(
  __dirname,
  '../src/__fixtures__/oas3-api-github-com.json',
);
const cliFilePath = join(__dirname, '../../../dist/oas3-visitor-typescript/cli.esm.js');

describe('CLI', () => {
  it('should describe the program in its help output', async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      cliFilePath,
      '--help',
    ], {
      env: {
        ...process.env,
        NO_COLOR: '1',
      },
    });

    const helpText = colors.stripColor(stdout);
    const normalizedHelpText = helpText.replaceAll(/\s+/g, ' ');

    expect(helpText).toContain(createGreeting(false));
    expect(helpText).toContain('oas3-visitor-typescript <command> [options]');
    expect(helpText).toContain('oas3-visitor-typescript convert');
    expect(helpText).toContain('oas3-visitor-typescript analyze');
    expect(helpText).toContain('Convert a JSON Schema file to TypeScript declarations');
    expect(helpText).toContain('Generate TypeScript from JSON Schema and OpenAPI 3');
    expect(normalizedHelpText).toContain('Dependency graphs and source metadata');
    expect(helpText).toContain('Options:');
  });

  it('should convert a comprehensive schema using shared path options', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'codegena-cli-'));

    try {
      const { stdout } = await execFileAsync(process.execPath, [
        cliFilePath,
        'convert',
        `--schemaFilePath=${schemaFilePath}`,
        `-o=${outputDir}`,
      ], {
        env: {
          ...process.env,
          NO_COLOR: '1',
        },
      });

      const expectedGroups = await jsonSchemaToTypescript({
        mode: 'singleFile',
        srcFilePath: schemaFilePath,
      });

      expect(await readdir(outputDir)).toEqual(['types.ts']);
      expect(await readFile(join(outputDir, 'types.ts'), 'utf8')).toBe(
        `${await expectedGroups[0].toString()}\n`,
      );
      expect(colors.stripColor(stdout)).toMatch(
        /Generated 1 TypeScript file\(s\) in \d+(?:\.\d{1,2})?s\.\n$/,
      );
    }
    finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('should import referenced types in separate files', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'codegena-cli-'));

    try {
      await execFileAsync(process.execPath, [
        cliFilePath,
        'convert',
        `--schemaFilePath=${schemaFilePath}`,
        `-o=${outputDir}`,
        '--mode=separateFiles',
      ], {
        env: {
          ...process.env,
          NO_COLOR: '1',
        },
      });

      const expectedDescription = [
        'An allOf-composition of object type aspects has to be merged into one and',
        'rendered as a TypeScript interface.',
      ].join('\n * ');

      const expectedRemark = [
        'Required `type` and `unknownProperty` MUST NOT be unknown in th resulting',
        'schema!',
      ].join('\n * ');

      const expectedFile = `
import type { SimpleObjectWithPattern } from './simple-object-with-pattern';
import type { SimpleObjectWithProperties } from './simple-object-with-properties';
import type { UserRoleEnum } from './user-role-enum';

/**
 * ${expectedDescription}
 *
 * @privateRemarks
 * ${expectedRemark}
 *
 * ###### allOf.1
 *
 * Enum type of the \`type\` extended by \`'inherited'\`
 */
export interface InlineObjectCompositionProperties {
  type: ['inherited', 'hasOnlyProperties', 'emptyObject'];
  unknownProperty: unknown;
  payload: SimpleObjectWithPattern | SimpleObjectWithProperties;
  group?: ['CoreProperty', 'BusinessProperty', 'TechnicalProperty'];
  tags?: ('Application' | 'Component' | 'Extension' | 'Legacy')[];
  role: UserRoleEnum | null;
}
`.trimStart();

      expect(await readFile(join(
        outputDir,
        'inline-object-composition-properties.ts',
      ), 'utf8')).toBe(expectedFile);
    }
    finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('should convert the GitHub OpenAPI fixture in separate files', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'codegena-cli-github-'));

    try {
      const { stdout } = await execFileAsync(process.execPath, [
        cliFilePath,
        'convert',
        `--schemaFilePath=${githubSchemaFilePath}`,
        `-o=${outputDir}`,
        '--mode=separateFiles',
      ], {
        env: {
          ...process.env,
          NO_COLOR: '1',
        },
        maxBuffer: 16 * 1024 * 1024,
      });

      const rootFile = await readFile(join(outputDir, 'index.ts'), 'utf8');
      const actionFiles = await readdir(join(
        outputDir,
        'actions',
        'delete-artifact',
      ));

      expect(rootFile).toContain('export namespace GitHubV3RestApi');
      expect(actionFiles).toContain('index.ts');
      expect(colors.stripColor(stdout)).toMatch(
        /Generated \d+ TypeScript file\(s\) in \d+(?:\.\d{1,2})?s\.\n$/,
      );
    }
    finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  }, 120000);
});
