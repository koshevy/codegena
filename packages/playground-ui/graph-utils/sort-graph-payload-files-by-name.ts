import type { GraphPayloadGroupNode } from '@codegena/graph-core';

export function sortGraphPayloadFilesByName(
  files: GraphPayloadGroupNode[],
): GraphPayloadGroupNode[] {
  return files.toSorted((first, second) => (
    first.data.fileName.localeCompare(second.data.fileName)
    || first.id.localeCompare(second.id)
  ));
}
