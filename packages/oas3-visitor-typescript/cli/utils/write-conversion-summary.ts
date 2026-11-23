export function writeConversionSummary(
  fileCount: number,
  elapsedSeconds: number,
): void {
  process.stdout.write(
    `Generated ${fileCount} TypeScript file(s) in ${elapsedSeconds}s.\n`,
  );
}
