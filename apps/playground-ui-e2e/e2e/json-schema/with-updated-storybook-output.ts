import { workspaceRoot } from '@nx/devkit';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export async function withUpdatedStorybookOutput(
  action: () => Promise<void>,
): Promise<void> {
  const filePath = join(
    workspaceRoot,
    'packages/playground-ui/storybook-static',
    `e2e-${randomUUID()}.html`,
  );

  await mkdir(dirname(filePath), { recursive: true });

  try {
    await writeFile(filePath, '<!doctype html><title>Storybook build output</title>');
    await action();
  }
  finally {
    await rm(filePath, { force: true });
  }
}
