import { compileConsumer } from './compile-consumer';

export async function getCompilerErrors(
  project: string,
  version: string,
  expectedDiagnostic: RegExp,
): Promise<{ error: object; errorLines: number[] }> {
  try {
    await compileConsumer(project, version, 'tsconfig.invalid.json');
  }
  catch (error) {
    if (!error || typeof error !== 'object'
      || !('stdout' in error) || typeof error.stdout !== 'string'
    ) {
      throw error;
    }

    const diagnostics = error.stdout.match(/^.*: error TS\d+:.*$/gm) ?? [];
    const errorLines = diagnostics.map((diagnostic) => (
      Number(expectedDiagnostic.exec(diagnostic)?.[1])
    ));

    return { error, errorLines };
  }

  throw new Error('Expected TypeScript to reject the fixture.');
}
