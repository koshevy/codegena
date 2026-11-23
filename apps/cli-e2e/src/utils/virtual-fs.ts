import {
  runCommandInDocker,
} from '@codegena/infr-nx/docker-compose/run-command-in-docker.cjs';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { getCustomCliParams } from '../expected-custom-cli-params';

const execute = promisify(execFile);
const cwd = resolve(__dirname, '../..');
const projectName = `cli-e2e-${process.pid}`;
const { dontSkipTestsForWindows, skipShootDownVirtualFs } = getCustomCliParams();
const compose = [
  'compose', '--project-name', projectName,
  ...(dontSkipTestsForWindows ? ['--profile', 'windows'] : []),
];

export { skipShootDownVirtualFs };

async function runCompose(...args: string[]): Promise<void> {
  await execute('docker', [...compose, ...args], { cwd });
}

export async function prepareVirtualFs(): Promise<void> {
  await runCompose('up', '--build', '--detach');
}

export async function checkIsVirtualFsInitialized(): Promise<void> {
  await runCompose(
    'exec', '--no-tty', 'workspace',
    'sh', '-c', 'test -f "$INIT_COMPLETE_FILE"',
  );

  if (dontSkipTestsForWindows) {
    await runCompose(
      'exec', '--no-tty', 'workspace-windows',
      'sh', '-c', 'test -f "$WIN_INIT_COMPLETE_FILE"',
    );
  }
}

export async function shootDownVirtualFs(): Promise<void> {
  await runCompose('down', '--volumes');
}

export function runWorkspaceCommand(
  command: string,
  args: string[],
  workdir: string,
): ReturnType<typeof runCommandInDocker> {
  return runCommandInDocker('workspace', command, args, { cwd, projectName, workdir });
}

export function runWindowsWorkspaceCommand(
  command: string,
  args: string[],
): ReturnType<typeof runCommandInDocker> {
  // Wine needs a TTY even when Jest captures the Windows command's output.
  return execute('docker', [
    ...compose,
    'exec', '--no-tty=false', '--interactive=false',
    'workspace-windows', command, ...args,
  ], { cwd, encoding: 'utf8' });
}
