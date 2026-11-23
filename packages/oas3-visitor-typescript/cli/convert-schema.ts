import {
  jsonSchemaToTypescript,
  type JsonSchemaToTypescriptProps,
} from '@codegena/oas3-visitor-typescript';
import { resolve } from 'node:path';

import {
  createOutputDirectories,
  createOutputPlans,
  writeOutputBatches,
} from './output-files';

export async function convertSchema(
  schemaFilePath: string,
  outputDirectory: string,
  mode: JsonSchemaToTypescriptProps['mode'],
): Promise<string[]> {
  const groups = await jsonSchemaToTypescript({
    mode,
    srcFilePath: resolve(schemaFilePath),
  });

  const outputPlans = createOutputPlans(groups, outputDirectory);

  await createOutputDirectories(outputPlans);
  await writeOutputBatches(outputPlans);

  return outputPlans.map(({ outputPath }) => outputPath);
}
