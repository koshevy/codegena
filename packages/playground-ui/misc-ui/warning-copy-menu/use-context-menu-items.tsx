import type { GraphPayloadLog } from '@codegena/graph-core';
import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import { Copy } from 'lucide-react';
import { useMemo } from 'react';

import { useCopyWarnings } from '../warning-utils';

export function useContextMenuItems(
  logs: GraphPayloadLog[],
  scope: 'single' | 'all',
  sourceSchemaText: string,
): ContextMenuItem[] {
  const copyWarnings = useCopyWarnings();
  const label = scope === 'single' ? 'Copy warning' : 'Copy all warnings';

  return useMemo(() => [{
    disabled: logs.length === 0,
    icon: <Copy aria-hidden />,
    id: 'copy-warnings',
    label,
    onSelect: () => {
      void copyWarnings(logs, sourceSchemaText);
    },
  }], [
    copyWarnings,
    label,
    logs,
    sourceSchemaText,
  ]);
}
