import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const workspaceRoot = resolve(__dirname, '../../..');
const cliFilePath = join(
  workspaceRoot,
  'dist/oas3-visitor-typescript/cli.esm.js',
);

const cases = [
  {
    fixture: join(
      'packages/oas3-visitor-typescript/src/__fixtures__',
      'oas3-api-github-com.json',
    ),
    namespace: 'GitHubV3RestApi',
    operationFile: 'actions/delete-artifact/index.ts',
    operationName: 'ActionsDeleteArtifact',
  },
  {
    fixture: join(
      'packages/oas3-core/transitive-parser/__fixtures__',
      'oas3-onepassword-connect.json',
    ),
    namespace: 'Api1PasswordConnect',
    operationFile: 'items/delete-item-by-id/index.ts',
    operationName: 'ItemsDeleteItemById',
  },
];

describe('locally built CLI', () => {
  it.each(cases)('converts $fixture into separate TypeScript files', async ({
    fixture,
    namespace,
    operationFile,
    operationName,
  }) => {
    const outputDir = await mkdtemp(join(tmpdir(), 'codegena-cli-e2e-'));

    try {
      const { stdout } = await execFileAsync(process.execPath, [
        cliFilePath,
        'convert',
        `--schemaFilePath=${join(workspaceRoot, fixture)}`,
        `--outputDir=${outputDir}`,
        '--mode=separateFiles',
      ], {
        cwd: workspaceRoot,
        env: {
          ...process.env,
          NO_COLOR: '1',
        },
        maxBuffer: 16 * 1024 * 1024,
      });

      const rootFile = await readFile(join(outputDir, 'index.ts'), 'utf8');
      const operation = await readFile(join(outputDir, operationFile), 'utf8');

      expect(stdout).toMatch(
        /Generated \d+ TypeScript file\(s\) in \d+(?:\.\d{1,2})?s\./,
      );
      expect(rootFile).toContain(`export namespace ${namespace}`);
      expect(operation).toContain(`export type { Response${operationName} } from `);
      expect(operation).toContain(`export type { PathParameters${operationName} } from `);
      expect(operation).not.toContain('export namespace');
    }
    finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
});
