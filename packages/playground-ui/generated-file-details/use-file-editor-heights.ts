import type { GraphPayloadGroupNode } from '@codegena/graph-core';
import { useMemo } from 'react';

export function useFileEditorHeights(
  selectedFiles: GraphPayloadGroupNode[],
): ReadonlyMap<string, number> {
  return useMemo(() => new Map(selectedFiles.map((file) => (
    [file.id, file.data.text.split('\n').length * 20 + 32]
  ))), [selectedFiles]);
}
