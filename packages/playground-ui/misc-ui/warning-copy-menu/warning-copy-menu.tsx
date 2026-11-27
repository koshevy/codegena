import type { GraphPayloadLog } from '@codegena/graph-core';
import { ContextMenu, type ContextMenuPosition } from '@codegena/ui-unified/menus';
import type { ReactElement } from 'react';

import { useContextMenuItems } from './use-context-menu-items';

export interface WarningCopyMenuProps {
  logs: GraphPayloadLog[];
  onClose: () => void;
  position: ContextMenuPosition | null;
  scope: 'single' | 'all';
  sourceSchemaText: string;
}

export function WarningCopyMenu({
  logs,
  onClose,
  position,
  scope,
  sourceSchemaText,
}: WarningCopyMenuProps): ReactElement {
  const items = useContextMenuItems(logs, scope, sourceSchemaText);

  return (
    <ContextMenu
      ariaLabel="Warning actions"
      items={items}
      onClose={onClose}
      position={position}
    />
  );
}
