export interface DockerCommandOptions {
  cwd: string;
  projectName: string;
  workdir: string;
}

export function runCommandInDocker(
  service: string,
  command: string,
  args: string[],
  options: DockerCommandOptions,
): Promise<{ stdout: string; stderr: string }>;
