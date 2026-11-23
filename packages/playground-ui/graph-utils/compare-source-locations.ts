import type { GraphPayloadSourceLocation } from '@codegena/graph-core';

export function compareSourceLocations(
  first: GraphPayloadSourceLocation,
  second: GraphPayloadSourceLocation,
): number {
  return first.fileName.localeCompare(second.fileName)
    || first.line - second.line
    || first.col - second.col;
}
