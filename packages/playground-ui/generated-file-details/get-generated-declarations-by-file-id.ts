import type {
  GraphPayloadItemNode,
  GraphPayloadNode,
} from '@codegena/graph-core';

/**
 * Groups generated declarations by file, keeping the first item on each line.
 */
export function getGeneratedDeclarationsByFileId(
  nodes: GraphPayloadNode[],
): Map<string, GraphPayloadItemNode[]> {
  const declarationsByFileAndLine = nodes.reduce((byFile, node) => {
    if (node.data.kind !== 'item'
      || !('extent' in node)
      || node.data.line === undefined
    ) {
      return byFile;
    }

    const byLine = byFile.get(node.parentId)
      ?? new Map<number, GraphPayloadItemNode>();

    if (!byLine.has(node.data.line)) {
      byLine.set(node.data.line, node);
    }

    byFile.set(node.parentId, byLine);

    return byFile;
  }, new Map<string, Map<number, GraphPayloadItemNode>>());

  return new Map([...declarationsByFileAndLine].map(([fileId, byLine]) => (
    [fileId, [...byLine.values()]]
  )));
}
