import { runCommandInDocker } from '@codegena/infr-nx/utils';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { getCustomCliParams } from '../expected-custom-cli-params';

const execute = promisify(execFile);
const cwd = resolve(__dirname, '../..');
const projectName = `cli-delivery-e2e-${process.pid}`;
const workspaceContainer = `${projectName}-workspace`;
const windowsWorkspaceContainer = `${projectName}-workspace-windows`;
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
  await runCommandInDocker(workspaceContainer, 'sh', [
    '-c', 'test -f "$INIT_COMPLETE_FILE"',
  ]);

  if (dontSkipTestsForWindows) {
    await runCommandInDocker(windowsWorkspaceContainer, 'sh', [
      '-c', 'test -f "$WIN_INIT_COMPLETE_FILE"',
    ]);
  }
}

export async function shootDownVirtualFs(): Promise<void> {
  await runCompose('down', '--volumes');
}

export function runWorkspaceCommand(
  command: string,
  args: string[],
  workdir: string,
): Promise<{ stdout: string; stderr: string }> {
  return runCommandInDocker(workspaceContainer, command, args, { workdir });
}

export function runWindowsWorkspaceCommand(
  command: string,
  args: string[],
): Promise<{ stdout: string; stderr: string }> {
  // Wine needs a TTY even when Jest captures the Windows command's output.
  return runCommandInDocker(windowsWorkspaceContainer, command, args, { tty: true });
}
