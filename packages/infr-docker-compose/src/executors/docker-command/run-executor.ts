import type { PromiseExecutor } from '@nx/devkit';

import type { UpExecutorSchema } from './schema';
import { runDockerComposeCommand } from '../../utils/index.ts';
import runBuildExecutor, { getComposeInputs } from '../build/run-executor.ts';

const runExecutor: PromiseExecutor<UpExecutorSchema> = async (options, context) => {
  const command = context.target?.executor?.split(':')[1];

  if (command !== 'up' && command !== 'push') {
    throw new Error('Expected the Docker Compose up or push executor.');
  }

  const {
    abortOnContainerExit,
    build,
    detached,
    dryRun,
    exitCodeFrom,
    services = [],
  } = options;
  const isUp = command === 'up';
  const shouldBuildFirst = build && (options.environment || !isUp);

  if (shouldBuildFirst) {
    const result = await runBuildExecutor(options, context);

    if (!result.success) {
      return result;
    }
  }

  const { source, dockerComposeFiles, envFile } = getComposeInputs(options, context);
  const args = isUp
    ? [
        'up',
        ...(build && !shouldBuildFirst ? ['--build'] : []),
        ...(detached ? ['--detach'] : []),
        ...(abortOnContainerExit ? ['--abort-on-container-exit'] : []),
        ...(exitCodeFrom ? ['--exit-code-from', exitCodeFrom] : []),
      ]
    : ['push'];

  return runDockerComposeCommand([...args, ...services], {
    dockerComposeFiles,
    dryRun,
    envFile,
    workspaceRoot: source.workspaceRoot,
  });
};

export default runExecutor;
