import type { GraphPayloadLog } from '@codegena/graph-core';
import { useCopyTextWithNotification } from '@codegena/playground-ui/clipboard';
import { useCallback } from 'react';

import { formatWarningForClipboard } from './format-warning-for-clipboard';

export function useCopyWarnings(): (
  logs: GraphPayloadLog[],
  sourceSchemaText: string,
) => Promise<void> {
  const copyText = useCopyTextWithNotification();

  return useCallback((logs, sourceSchemaText) => {
    const text = logs
      .map((log) => formatWarningForClipboard(log, sourceSchemaText))
      .join('\n\n');

    return copyText({
      failureMessage: 'Could not copy warnings',
      successMessage: logs.length === 1
        ? 'Warning copied'
        : `${logs.length} warnings copied`,
      text,
    });
  }, [copyText]);
}
