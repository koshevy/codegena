import type { GraphPayloadLog } from '@codegena/graph-core';

import type { GraphSearchDocument } from './graph-search-document';

function removeSourceExcerpt(message: string): string {
  const lines = message.split('\n');
  const sourceLineIndex = lines.findIndex((line) => {
    const dividerIndex = line.indexOf('|');
    const prefix = line.slice(0, dividerIndex).trim().replace(/^>\s*/, '');

    return dividerIndex !== -1
      && prefix.length > 0
      && Number.isSafeInteger(Number(prefix));
  });
  const meaningfulLines = sourceLineIndex === -1
    ? lines
    : lines.slice(0, sourceLineIndex);

  return meaningfulLines.join(' ').trim();
}

/**
 * Prepare a diagnostic once for both the index and default ranking.
 */
export function prepareGraphPayloadLog(
  log: GraphPayloadLog,
  index: number,
): GraphSearchDocument {
  const title = removeSourceExcerpt(log.message);
  const errorMessage = log.error
    ? removeSourceExcerpt(log.error.message)
    : '';

  const location = log.jsoncNode;
  const searchText = [
    title,
    log.level,
    log.error?.name ?? '',
    errorMessage,
    location?.fileName ?? '',
    location ? `line:${location.line}` : '',
  ].join(' ');

  return {
    id: `warning:${index}`,
    searchText,
    suggestion: {
      id: `warning:${index}`,
      kind: 'warning',
      sourceLocation: location,
      title,
    },
    title,
    warningLevel: log.level,
  };
}
