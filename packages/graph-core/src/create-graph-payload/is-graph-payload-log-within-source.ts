import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

import { createGraphPayloadSourceLocation } from './create-graph-payload-source-location';
import type {
  GraphPayloadLogEntry,
} from './map-collected-log-to-graph-payload-log-entry';
import type { GraphPayloadSourceLocation } from '../graph-payload-source-location';

function compareLocations(
  left: GraphPayloadSourceLocation,
  right: GraphPayloadSourceLocation,
): number {
  return left.line - right.line || left.col - right.col;
}

export function isGraphPayloadLogWithinSource(
  { log, sourceOffset }: GraphPayloadLogEntry,
  source: TransitiveNode['source'],
): boolean {
  const location = log.jsoncNode;

  if (!location || location.fileName !== source.sourceFileId) {
    return false;
  }

  if (sourceOffset !== undefined) {
    const startOffset = source.node.offset;
    const endOffset = startOffset + source.node.length;

    return sourceOffset >= startOffset && sourceOffset < endOffset;
  }

  const start = createGraphPayloadSourceLocation(source);
  const end = createGraphPayloadSourceLocation(
    source,
    source.node.offset + source.node.length,
  );

  return compareLocations(location, start) >= 0
    && compareLocations(location, end) < 0;
}
