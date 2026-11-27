import { writeFile } from 'node:fs/promises';

import type { OutputPlan } from './create-output-plans';
import { writeBatchSize } from './write-output-batches.config';

export async function writeOutputBatches(
  outputPlans: OutputPlan[],
): Promise<void> {
  const batches = Array.from(
    { length: Math.ceil(outputPlans.length / writeBatchSize) },
    (_, index) => outputPlans.slice(
      index * writeBatchSize,
      (index + 1) * writeBatchSize,
    ),
  );

  await batches.reduce(async (previousWrite, batch) => {
    await previousWrite;
    await Promise.all(batch.map(async ({ group, outputPath }) => {
      const renderedText = await group.toString();

      return writeFile(outputPath, `${renderedText}\n`, 'utf8');
    }));
  }, Promise.resolve());
}
