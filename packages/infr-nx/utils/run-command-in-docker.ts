import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

interface DockerCommandOptions {
  workdir?: string;
  tty?: boolean;
}

const execute = promisify(execFile);

/** Prepare a command for an already running Docker container. */
export function getCommandInDocker(
  containerName: string,
  commandInDocker: string,
  argsInDocker: string[],
  { workdir, tty }: DockerCommandOptions = {},
): { command: 'docker'; args: string[] } {
  return {
    command: 'docker',
    args: [
      'exec',
      ...(workdir ? ['-w', workdir] : []),
      ...(tty ? ['-t'] : []),
      containerName,
      commandInDocker,
      ...argsInDocker,
    ],
  };
}

/** Run a Docker command and capture its output and exit status. */
export function runCommandInDocker(
  containerName: string,
  commandInDocker: string,
  argsInDocker: string[],
  options?: DockerCommandOptions,
): Promise<{ stdout: string; stderr: string }> {
  const { command, args } = getCommandInDocker(
    containerName, commandInDocker, argsInDocker, options,
  );

  return execute(command, args, { encoding: 'utf8' });
}
