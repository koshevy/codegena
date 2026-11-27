import type { ExecutorContext, PromiseExecutor } from '@nx/devkit';
import { resolve } from 'node:path';

import type { BuildExecutorSchema } from './schema';
import {
  type DockerComposeConfigs,
  findDockerComposeConfigs,
  getMergedDockerComposeFilePath,
  getMergedEnvFilePath,
  mergeComposeFiles,
  prepareEnvFile,
  runDockerComposeCommand,
} from '../../utils/index.ts';

interface ComposeInputs {
  source: DockerComposeConfigs;
  dockerComposeFiles: string[];
  envFile?: string;
}

export function getComposeInputs(
  options: BuildExecutorSchema,
  context: ExecutorContext,
): ComposeInputs {
  const source = findDockerComposeConfigs(options, context);
  const { environment, outputPath } = options;

  if (!environment) {
    return {
      source,
      dockerComposeFiles: source.dockerComposeFiles,
      envFile: source.envFiles[0],
    };
  }

  const output = { environment, outputPath, projects: source.projects };
  const composeFile = getMergedDockerComposeFilePath({
    ...output,
    workspaceRoot: context.root,
  });

  return {
    source,
    dockerComposeFiles: [composeFile],
    envFile: resolve(context.root, getMergedEnvFilePath(output)),
  };
}

const runExecutor: PromiseExecutor<BuildExecutorSchema> = async (options, context) => {
  const { source, dockerComposeFiles, envFile } = getComposeInputs(options, context);

  if (envFile && options.environment) {
    await prepareEnvFile(source.envFiles, envFile);

    const prepared = await mergeComposeFiles(
      { ...source, envFile },
      dockerComposeFiles[0],
    );

    if (!prepared.success) {
      return prepared;
    }
  }

  const { services = [] } = options;

  return runDockerComposeCommand(['build', ...services], {
    dockerComposeFiles,
    dryRun: options.dryRun,
    envFile,
    workspaceRoot: source.workspaceRoot,
  });
};

export default runExecutor;
