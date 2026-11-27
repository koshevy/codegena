import { interpolate } from 'env-interpolation';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseEnv } from 'node:util';

interface RunDockerComposeCommandOptions {
  dockerComposeFiles: string[];
  envFile?: string;
  dryRun?: boolean;
  workspaceRoot: string;
}

export function runDockerComposeCommand(command: string[], {
  dockerComposeFiles,
  dryRun,
  envFile,
  workspaceRoot,
}: RunDockerComposeCommandOptions): Promise<{ success: boolean }> {
  const args = [
    'compose',
    '--project-directory',
    workspaceRoot,
    ...(dryRun ? ['--dry-run'] : []),
    ...(envFile ? ['--env-file', envFile] : []),
    ...dockerComposeFiles.flatMap((file) => ['--file', file]),
    ...command,
  ];

  return new Promise((resolve, reject) => {
    const docker = spawn('docker', args, { cwd: workspaceRoot, stdio: 'inherit' });

    docker.once('error', reject);
    docker.once('close', (code) => resolve({ success: code === 0 }));
  });
}

export async function prepareEnvFile(
  envFiles: string[],
  outputFile: string,
): Promise<void> {
  const contents = await Promise.all(envFiles.map((file) => readFile(file, 'utf8')));
  const variables = new Map<string, string>();

  for (const content of contents) {
    const declarations = Object.entries(parseEnv(content));

    for (const [name, value] of declarations) {
      if (variables.has(name)) {
        throw new Error('Duplicate Compose environment variable: ' + name);
      }

      variables.set(name, value ?? '');
    }
  }

  const assignments = Array.from(variables, ([name, value]) => {
    const resolvedValue = interpolate(value, undefined, { maxPasses: 1 });
    // Preserve literal dollar signs when Compose reads the resolved values.
    const quotedValue = JSON.stringify(resolvedValue.replaceAll('$', () => '$$'));

    return name + '=' + quotedValue;
  });

  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, assignments.join('\n') + '\n', { mode: 0o600 });
}

export function mergeComposeFiles(
  options: RunDockerComposeCommandOptions,
  outputFile: string,
): Promise<{ success: boolean }> {
  const command = ['config', '--no-path-resolution', '--output', outputFile];

  return runDockerComposeCommand(command, options);
}
