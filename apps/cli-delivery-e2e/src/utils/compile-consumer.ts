import { runWorkspaceCommand } from './virtual-fs';

export function compileConsumer(
  project: string,
  version: string,
  config: string,
): ReturnType<typeof runWorkspaceCommand> {
  return runWorkspaceCommand(
    `/opt/typescript/${version}/node_modules/.bin/tsc`,
    ['--project', config, '--pretty', 'false'],
    project,
  );
}
