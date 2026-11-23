import type { GraphPayloadLog } from '@codegena/graph-core';
import { DeclarationTypeIcon } from '@codegena/ui-unified/icons';
import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import { TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';

import type { DeclarationGlyphLine } from './create-declaration-glyph-lines';

export function useContextMenuItems(
  sourceLine: DeclarationGlyphLine,
  onRevealNode?: (nodeId: string) => void,
  onRevealWarning?: (log: GraphPayloadLog) => void,
): ContextMenuItem[] {
  const { items, logs } = sourceLine;

  return useMemo(() => {
    const menuItems: ContextMenuItem[] = items.map((item) => ({
      icon: (
        <DeclarationTypeIcon
          asButton={false}
          declarationType={item.data.declarationType}
          noHoverStyles
          title={null}
        />
      ),
      id: item.id,
      label: item.data.label,
      onSelect: () => onRevealNode?.(item.id),
    }));

    if (logs[0]) {
      menuItems.push({
        icon: <TriangleAlert aria-hidden />,
        id: 'warnings',
        label: 'Show warnings',
        onSelect: () => onRevealWarning?.(logs[0]),
      });
    }

    return menuItems;
  }, [
    items,
    logs,
    onRevealNode,
    onRevealWarning,
  ]);
}
