import { jsonSchemaToTypescript } from '@codegena/oas3-visitor-typescript';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createOutputDirectories } from './create-output-directories';
import type { OutputPlan } from './create-output-plans';
import { writeOutputBatches } from './write-output-batches';
import { writeBatchSize } from './write-output-batches.config';

const schemaFilePath = join(__dirname, '../__fixtures__/account.jsonc');

async function checkOutputBatches(outputDirectory: string): Promise<void> {
  const groups = await jsonSchemaToTypescript({
    mode: 'singleFile',
    srcFilePath: schemaFilePath,
  });
  const group = groups[0];

  if (!group) {
    throw new Error('Expected a generated group.');
  }

  const outputPlans: OutputPlan[] = Array.from(
    { length: writeBatchSize + 1 },
    (_, index) => ({
      group,
      outputPath: join(outputDirectory, `part-${index}.ts`),
    }),
  );

  await createOutputDirectories(outputPlans);
  await writeOutputBatches(outputPlans);

  expect(await readdir(outputDirectory)).toHaveLength(writeBatchSize + 1);
  expect(await readFile(
    join(outputDirectory, `part-${writeBatchSize}.ts`),
    'utf8',
  )).toBe(`${await group.toString()}\n`);
}

describe('writeOutputBatches', () => {
  it('writes files on both sides of a batch boundary', async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'codegena-batches-'));

    try {
      await checkOutputBatches(outputDirectory);
    }
    finally {
      await rm(outputDirectory, { force: true, recursive: true });
    }
  });
});
