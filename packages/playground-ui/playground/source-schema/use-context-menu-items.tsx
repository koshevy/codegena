import type { ContextMenuItem } from '@codegena/ui-unified/menus';
import { PanelLeftClose } from 'lucide-react';
import { useMemo } from 'react';

export function useContextMenuItems(onHide: () => void): ContextMenuItem[] {
  return useMemo(() => [{
    icon: <PanelLeftClose aria-hidden />,
    id: 'hide-source',
    label: 'Hide source column',
    onSelect: onHide,
  }], [onHide]);
}
