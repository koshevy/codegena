import { runWorkspaceCommand } from './virtual-fs';

export function compileConsumer(
  project: string,
  version: string,
  config: string,
): ReturnType<typeof runWorkspaceCommand> {
  return runWorkspaceCommand('npx', [
    '--yes',
    '--loglevel=warn',
    `--package=typescript@${version}`,
    '--',
    'tsc', '--project', config, '--pretty', 'false',
  ], project);
}
