import type {
  GraphPayload,
  GraphPayloadItemNode,
  GraphPayloadLog,
} from '@codegena/graph-core';

export interface DeclarationGlyphLine {
  items: GraphPayloadItemNode[];
  line: number;
  logs: GraphPayloadLog[];
}

export function createDeclarationGlyphLines(
  graph: GraphPayload,
  lineCount: number,
  logLevels: readonly string[],
): DeclarationGlyphLine[] {
  const items = graph.nodes
    .filter((node): node is GraphPayloadItemNode => node.data.kind === 'item')
    .filter(({ data }) => (
      data.sourceLocation.line >= 1
      && data.sourceLocation.line <= lineCount
    ))
    .toSorted((first, second) => (
      first.data.sourceLocation.line - second.data.sourceLocation.line
      || first.data.sourceLocation.col - second.data.sourceLocation.col
    ));

  const logs = graph.logs.filter(({ jsoncNode, level }) => (
    logLevels.includes(level)
    && (jsoncNode?.line ?? 0) >= 1
    && (jsoncNode?.line ?? 0) <= lineCount
  ));

  const itemsByLine = Map.groupBy(items, ({ data }) => data.sourceLocation.line);
  const logsByLine = Map.groupBy(logs, ({ jsoncNode }) => jsoncNode?.line ?? 0);

  const lineNumbers = new Set([
    ...itemsByLine.keys(),
    ...logsByLine.keys(),
  ]);

  return [...lineNumbers]
    .toSorted((first, second) => first - second)
    .map((line) => ({
      items: itemsByLine.get(line) ?? [],
      line,
      logs: logsByLine.get(line) ?? [],
    }));
}
