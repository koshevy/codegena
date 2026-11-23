import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { getLineAndColByContent } from '@codegena/oas3-core/transitive-parser';

import type { GraphPayloadSourceLocation } from '../graph-payload-source-location';

export function createGraphPayloadSourceLocation(
  source: TransitiveNode['source'],
  offset = source.node.offset,
): GraphPayloadSourceLocation {
  const { col, line } = getLineAndColByContent(
    source.getOriginalFileContent(),
    offset,
  );

  return {
    col,
    fileName: source.sourceFileId,
    line,
  };
}
