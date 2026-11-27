import { workspaceRoot } from '@nx/devkit';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export default async function startSsrTestStack(): Promise<() => Promise<void>> {
  const composeArgs = [
    'compose',
    '--project-name', `landing-e2e-${randomUUID()}`,
    '--env-file', join(workspaceRoot, 'apps/landing-mf-host-ssr/.env.local'),
    '--file', join(workspaceRoot, 'apps/landing-mf-host-ssr/docker-compose.yml'),
    '--file', join(import.meta.dirname, 'docker-compose.ssr.yml'),
  ];

  async function stopSsrTestStack(): Promise<void> {
    await execFileAsync('docker', [...composeArgs, 'down', '--volumes']);
  }

  try {
    await execFileAsync('docker', [
      ...composeArgs, 'up', '--wait', '--no-build', '--pull', 'never',
    ]);
  }
  catch (startupError) {
    try {
      await stopSsrTestStack();
    }
    catch (cleanupError) {
      throw new AggregateError(
        [startupError, cleanupError],
        'Could not start or remove the SSR test stack.',
        { cause: cleanupError },
      );
    }

    throw startupError;
  }

  return stopSsrTestStack;
}
