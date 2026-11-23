import type { jsonSchemaToTypescript } from '@codegena/oas3-visitor-typescript';
import { isAbsolute, relative, resolve, sep } from 'node:path';

type GeneratedGroups = Awaited<ReturnType<typeof jsonSchemaToTypescript>>;

export interface OutputPlan {
  group: GeneratedGroups[number];
  outputPath: string;
}

export function createOutputPlans(
  groups: GeneratedGroups,
  outputDirectory: string,
): OutputPlan[] {
  const outputDirectoryPath = resolve(outputDirectory);

  return groups.map((group) => {
    const outputPath = resolve(
      outputDirectoryPath,
      group.sourceFile.fileName,
    );
    const relativePath = relative(outputDirectoryPath, outputPath);

    if (
      relativePath === '..'
      || relativePath.startsWith(`..${sep}`)
      || isAbsolute(relativePath)
    ) {
      throw new Error(
        `Generated file path escapes the output directory: ${outputPath}`,
      );
    }

    return { group, outputPath };
  });
}
