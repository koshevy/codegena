export function getElapsedSeconds(startedAt: number): number {
  return Math.round((performance.now() - startedAt) / 10) / 100;
}
