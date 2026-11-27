import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { OutputPlan } from './create-output-plans';

export async function createOutputDirectories(
  outputPlans: OutputPlan[],
): Promise<void> {
  const directories = [...new Set(outputPlans.map(({ outputPath }) => (
    dirname(outputPath)
  )))];

  await Promise.all(directories.map((directory) => (
    mkdir(directory, { recursive: true })
  )));
}
