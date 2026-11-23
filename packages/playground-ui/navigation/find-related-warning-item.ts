import type {
  GraphPayload,
  GraphPayloadItemNode,
  GraphPayloadLog,
} from '@codegena/graph-core';

function isSameLog(first: GraphPayloadLog, second: GraphPayloadLog): boolean {
  return first.level === second.level
    && first.message === second.message
    && first.jsoncNode?.fileName === second.jsoncNode?.fileName
    && first.jsoncNode?.line === second.jsoncNode?.line
    && first.jsoncNode?.col === second.jsoncNode?.col;
}

export function findRelatedWarningItem(
  graph: GraphPayload,
  log: GraphPayloadLog,
): GraphPayloadItemNode | undefined {
  const items = graph.nodes.filter((node): node is GraphPayloadItemNode => (
    node.data.kind === 'item'
  ));

  const itemsWithLog = items.filter(({ data }) => (
    data.logs.some((itemLog) => isSameLog(itemLog, log))
  ));

  const location = log.jsoncNode;

  if (!location) {
    return itemsWithLog[0];
  }

  const itemsInFile = items.filter(({ data }) => (
    data.sourceLocation.fileName === location.fileName
  )).toSorted((first, second) => (
    first.data.sourceLocation.line - second.data.sourceLocation.line
  ));

  const relatedItems = itemsInFile.filter(({ id }) => (
    itemsWithLog.some((item) => item.id === id)
  ));

  const candidates = relatedItems.length ? relatedItems : itemsInFile;

  return candidates.findLast(({ data }) => (
    data.sourceLocation.line <= location.line
  )) ?? candidates[0];
}
