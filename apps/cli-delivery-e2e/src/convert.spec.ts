import { stripVTControlCharacters } from 'node:util';

import { getCustomCliParams } from './expected-custom-cli-params';
import {
  compileConsumer,
  getCompilerErrors,
  runWindowsWorkspaceCommand,
  runWorkspaceCommand,
} from './utils';

const {
  TYPESCRIPT_5_VERSION: typescript5Version,
  TYPESCRIPT_6_VERSION: typescript6Version,
  TYPESCRIPT_7_VERSION: typescript7Version,
} = process.env;

if (!typescript5Version || !typescript6Version || !typescript7Version) {
  throw new Error('Set TypeScript versions in .env.local before running CLI E2E.');
}

const compilerVersions = [typescript5Version, typescript6Version, typescript7Version];
const specifications = ['github', 'one-password', 'pet-store'] as const;
const rootAssignmentLines = { 'github': [4], 'one-password': [4], 'pet-store': [4] };
const importForms = [
  { assignmentLines: rootAssignmentLines, directory: '01-root-namespace' },
  { assignmentLines: rootAssignmentLines, directory: '02-root-default' },
  { assignmentLines: null, directory: '03-subpath-default' },
  {
    assignmentLines: {
      'github': [5, 10],
      'one-password': [6, 11, 15, 19],
      'pet-store': [5, 10],
    },
    directory: '04-subpath-named',
  },
  { assignmentLines: rootAssignmentLines, directory: '05-root-named' },
  { assignmentLines: rootAssignmentLines, directory: '06-root-lib' },
];

const { dontSkipTestsForWindows } = getCustomCliParams();
const describeWindows = dontSkipTestsForWindows ? describe : describe.skip;

describe('convert', () => {
  describe('PUB-01 generated imports', () => {
    beforeAll(async () => {
      for (const specification of specifications) {
        await runWorkspaceCommand('npx', [
          '--yes',
          '--loglevel=warn',
          '--package=@codegena/oas3-visitor-typescript@e2e',
          '--',
          'oas3-visitor-typescript',
          'convert',
          `--schemaFilePath=/opt/e2e/specifications/${specification}.json`,
          '--outputDir=generated',
          '--mode=separateFiles',
        ], `/tmp/consumers/${specification}`);
      }
    });

    describe.each(importForms)('$directory', ({ assignmentLines, directory }) => {
      describe.each(specifications)('%s', (specification) => {
        const project = `/tmp/consumers/${specification}/${directory}`;

        if (assignmentLines) {
          it.each(compilerVersions)(
            'accepts valid data on TypeScript %s',
            async (version) => {
              const { stdout, stderr } = await compileConsumer(
                project, version, 'tsconfig.json',
              );

              expect(stdout).toBe('');
              expect(stderr).toBe('');
            },
          );

          it.each(compilerVersions)(
            'rejects invalid data on TypeScript %s',
            async (version) => {
              const { error, errorLines } = await getCompilerErrors(
                project,
                version,
                /^invalid\.ts\((\d+),\d+\): error TS2322:/,
              );

              expect(error).toMatchObject({ stderr: '' });
              expect(errorLines).toEqual(assignmentLines[specification]);
            },
          );
        }
        else {
          it.each(compilerVersions)(
            'rejects default import on TypeScript %s',
            async (version) => {
              const { error, errorLines } = await getCompilerErrors(
                project,
                version,
                /^invalid\.ts\((\d+),\d+\): error TS(?:1192|2613):/,
              );

              expect(error).toMatchObject({ stderr: '' });
              expect(errorLines).toEqual([1]);
            },
          );
        }
      });
    });
  });

  describeWindows('PUB-02 smoke test for Windows', () => {
    it('converts 1Password Connect and runs the compiled consumer', async () => {
      const platform = await runWindowsWorkspaceCommand('node', [
        '-p', 'process.platform',
      ]);

      expect(stripVTControlCharacters(platform.stdout).trim()).toBe('win32');

      const conversion = await runWindowsWorkspaceCommand('npx', [
        '--yes',
        '--loglevel=warn',
        '--package=@codegena/oas3-visitor-typescript@e2e',
        '--',
        'oas3-visitor-typescript',
        'convert',
        String.raw`--schemaFilePath=.\one-password.json`,
        '--outputDir=generated',
        '--mode=separateFiles',
      ]);

      expect(stripVTControlCharacters(conversion.stdout)).toMatch(
        /Generated [1-9]\d* TypeScript file/,
      );

      await runWindowsWorkspaceCommand('npx', [
        '--yes',
        '--loglevel=warn',
        `--package=typescript@${typescript6Version}`,
        '--',
        'tsc', '--project', 'tsconfig.json', '--pretty', 'false',
      ]);

      await runWindowsWorkspaceCommand('node', [String.raw`build\valid.js`]);
    });
  });
});
