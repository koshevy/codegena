import type { CommandModule } from 'yargs';

import { convertSchema } from '../convert-schema';
import {
  getElapsedSeconds,
  writeConversionSummary,
} from '../utils';

interface ConvertCommandBaseOptions {
  schemaFilePath?: string;
  outputDir: string;
}

interface ConvertCommandOptions extends ConvertCommandBaseOptions {
  mode: 'singleFile' | 'separateFiles';
}

export const convertCommand: CommandModule<
  ConvertCommandBaseOptions,
  ConvertCommandOptions
> = {
  command: 'convert',
  describe: 'Convert a JSON Schema file to TypeScript declarations',
  builder: (command) => command.option('mode', {
    choices: ['singleFile', 'separateFiles'] as const,
    default: 'singleFile' as const,
    describe: 'Whether to combine declarations or create separate files',
  }),
  handler: async (options) => {
    if (!options.schemaFilePath) {
      throw new Error('A schema file path is required.');
    }

    const startedAt = performance.now();

    const outputPaths = await convertSchema(
      options.schemaFilePath,
      options.outputDir,
      options.mode,
    );

    const elapsedSeconds = getElapsedSeconds(startedAt);

    writeConversionSummary(outputPaths.length, elapsedSeconds);
  },
};
